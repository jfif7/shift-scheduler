"""
Scenario-based test framework for the CP-SAT scheduling solver.
===============================================================

Goal: make it trivial to describe a realistic scheduling situation (a
"scenario") and have the test suite automatically verify that the solver's
output obeys every HARD constraint the solver promises.

A scenario is just data:

    Scenario(
        id="my_case",
        description="what this checks",
        employees=[...],          # built with make_employee(...)
        settings=...,             # built with make_settings(...)
        constraints=[...],        # built with avoid(...) / prefer(...)
        month=7, year=2025,       # month is 0-based (7 = August)
        expect_feasible=True,     # set False to assert the solver rejects it
    )

To add your own test case, append a Scenario to the lists in
``test_doctor_nurse.py`` (or any test file) and parametrize a test with it.
``assert_hard_constraints`` then checks ALL of the invariants below for you.

------------------------------------------------------------------
What counts as a HARD constraint (always guaranteed by the solver)
------------------------------------------------------------------
* exact staffing       -- every shift has exactly persons_per_shift[s] people
* monthly min/max      -- shifts_per_month[0] <= count <= shifts_per_month[1]
* weekday/weekend bands -- per-employee weekday & weekend counts stay in band
* one-shift-per-day    -- when prevent_multiple_shifts_per_day is on
* max consecutive days -- no over-long working streak (non weekend-type staff)
* minimum rest days    -- enough gap between shifts (non weekend-type staff)
* rookie / veteran cap  -- at most one rookie and one veteran per single shift
* max shifts per week  -- per the Sunday-anchored week partition (max side)

What is NOT auto-checked (and why):
* AVOID / PREFER constraints are SOFT (objective terms), so the solver may
  violate them under pressure. Use ``count_soft_violations`` to inspect them.
* The MINIMUM weekly-shift side is not auto-checked: the solver only enforces
  it on weeks above a partial-week threshold, so add it per-scenario if needed.
* max_consecutive_shifts is accepted by the API but the solver never applies
  it -- there is no behavior to assert.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple

from models.schedule_models import (
    Employee,
    Constraint,
    ConstraintType,
    ScheduleSettings,
    GenerateScheduleResponse,
)
from services.cp_sat_solver import ScheduleSolver, TAG
from utils.date_utils import get_days_in_month, get_first_day_of_month, is_weekend


# ---------------------------------------------------------------------------
# Builders -- compact, readable ways to declare scenario data
# ---------------------------------------------------------------------------

def make_employee(
    name: str,
    *,
    shifts: Tuple[int, int] = (0, 31),
    weekday: Tuple[int, int] = (0, 31),
    weekend: Tuple[int, int] = (0, 31),
    tags: Optional[List[str]] = None,
    emp_id: Optional[str] = None,
) -> Employee:
    """Create one employee. Bounds default to "wide open" so a newly added
    employee never accidentally makes a scenario infeasible. Tighten the
    bounds only when the bound itself is what you want to test."""
    return Employee(
        id=emp_id or f"emp::{name}",
        name=name,
        shifts_per_month=[shifts[0], shifts[1]],
        weekday_shifts=[weekday[0], weekday[1]],
        weekend_shifts=[weekend[0], weekend[1]],
        tags=list(tags or []),
    )


def make_team(
    count: int,
    *,
    name_prefix: str,
    shifts: Tuple[int, int],
    weekday: Tuple[int, int],
    weekend: Tuple[int, int],
    tags_by_index: Optional[Dict[int, List[str]]] = None,
) -> List[Employee]:
    """Create ``count`` similar employees in one line. ``tags_by_index`` lets
    you tag a few of them (e.g. {0: [TAG.VETERAN], 5: [TAG.ROOKIE]})."""
    tags_by_index = tags_by_index or {}
    return [
        make_employee(
            f"{name_prefix}{i + 1:02d}",
            shifts=shifts,
            weekday=weekday,
            weekend=weekend,
            tags=tags_by_index.get(i, []),
        )
        for i in range(count)
    ]


def make_settings(
    *,
    shifts_per_day: int = 1,
    persons_per_shift: Optional[List[int]] = None,
    max_consecutive_shifts: int = 3,
    max_consecutive_days: int = 6,
    min_rest_days_between_shifts: int = 0,
    prevent_multiple_shifts_per_day: bool = True,
    max_shifts_per_week: int = 7,
    min_shifts_per_week: int = 0,
    even_distribution: bool = True,
    fairness_weight: int = 1,
    preference_weight: int = 1,
) -> ScheduleSettings:
    """Create settings with sensible defaults. ``persons_per_shift`` defaults
    to one person on each shift."""
    if persons_per_shift is None:
        persons_per_shift = [1] * shifts_per_day
    return ScheduleSettings(
        shifts_per_day=shifts_per_day,
        persons_per_shift=persons_per_shift,
        max_consecutive_shifts=max_consecutive_shifts,
        max_consecutive_days=max_consecutive_days,
        min_rest_days_between_shifts=min_rest_days_between_shifts,
        prevent_multiple_shifts_per_day=prevent_multiple_shifts_per_day,
        max_shifts_per_week=max_shifts_per_week,
        min_shifts_per_week=min_shifts_per_week,
        even_distribution=even_distribution,
        fairness_weight=fairness_weight,
        preference_weight=preference_weight,
    )


def avoid(emp: Employee, date: int, shift: int = 0) -> Constraint:
    """`emp` would prefer NOT to work this shift (soft constraint)."""
    return Constraint(
        id=f"avoid::{emp.id}::{date}::{shift}",
        employee_id=emp.id,
        type=ConstraintType.AVOID,
        date=date,
        shift_index=shift,
    )


def prefer(emp: Employee, date: int, shift: int = 0) -> Constraint:
    """`emp` would prefer TO work this shift (soft constraint)."""
    return Constraint(
        id=f"prefer::{emp.id}::{date}::{shift}",
        employee_id=emp.id,
        type=ConstraintType.PREFER,
        date=date,
        shift_index=shift,
    )


# ---------------------------------------------------------------------------
# Scenario definition
# ---------------------------------------------------------------------------

@dataclass
class Scenario:
    id: str
    description: str
    employees: List[Employee]
    settings: ScheduleSettings
    month: int  # 0-based: 0 = January, 7 = August
    year: int
    constraints: List[Constraint] = field(default_factory=list)
    expect_feasible: bool = True
    timeout: int = 15

    @property
    def days_in_month(self) -> int:
        return get_days_in_month(self.month, self.year)

    def employee_by_id(self, emp_id: str) -> Employee:
        return next(e for e in self.employees if e.id == emp_id)


def run_scenario(scenario: Scenario) -> GenerateScheduleResponse:
    """Solve a scenario with a fresh solver instance and return the response."""
    solver = ScheduleSolver()
    return solver.solve_schedule(
        employees=scenario.employees,
        constraints=scenario.constraints,
        settings=scenario.settings,
        month=scenario.month,
        year=scenario.year,
        timeout=scenario.timeout,
    )


# ---------------------------------------------------------------------------
# Result accessors -- turn a response into easy-to-assert-on shapes
# ---------------------------------------------------------------------------

def assignments_by_day_shift(
    result: GenerateScheduleResponse,
) -> Dict[Tuple[int, int], List[str]]:
    """{(day, shift_index): [employee_id, ...]} for the whole month."""
    out: Dict[Tuple[int, int], List[str]] = {}
    for day, day_sched in result.schedule.days.items():
        for shift_idx, shift in enumerate(day_sched.shifts):
            out[(day, shift_idx)] = list(shift.employee_ids)
    return out


def days_worked(result: GenerateScheduleResponse, emp_id: str) -> List[int]:
    """Sorted, de-duplicated list of day-numbers on which `emp_id` works."""
    worked: Set[int] = set()
    for day, day_sched in result.schedule.days.items():
        for shift in day_sched.shifts:
            if emp_id in shift.employee_ids:
                worked.add(day)
    return sorted(worked)


def shift_count(result: GenerateScheduleResponse, emp_id: str) -> int:
    """Total number of shifts (day x shift slots) assigned to `emp_id`."""
    total = 0
    for day_sched in result.schedule.days.values():
        for shift in day_sched.shifts:
            total += shift.employee_ids.count(emp_id)
    return total


def weekday_weekend_counts(
    result: GenerateScheduleResponse, emp_id: str, month: int, year: int
) -> Tuple[int, int]:
    """(weekday_shifts, weekend_shifts) for `emp_id`, using the solver's own
    weekend definition (Saturday/Sunday)."""
    weekday_n = weekend_n = 0
    for day, day_sched in result.schedule.days.items():
        for shift in day_sched.shifts:
            if emp_id in shift.employee_ids:
                if is_weekend(day, month, year):
                    weekend_n += 1
                else:
                    weekday_n += 1
    return weekday_n, weekend_n


def longest_streak(day_numbers: List[int]) -> int:
    """Longest run of consecutive day-numbers in a sorted list."""
    if not day_numbers:
        return 0
    best = run = 1
    for prev, cur in zip(day_numbers, day_numbers[1:]):
        run = run + 1 if cur == prev + 1 else 1
        best = max(best, run)
    return best


def correct_weekly_windows(
    days_in_month: int, month: int, year: int
) -> List[Tuple[int, int]]:
    """The INTENDED, non-overlapping Sunday-anchored week windows ``[start, end)``
    for a month. The first/last weeks may be partial. This is what
    ``ScheduleSolver._weekly_windows`` *should* produce -- it is used both by the
    weekly-limit checker and by the test that pins the solver's known
    week-partition bug."""
    first = get_first_day_of_month(month, year)
    windows: List[Tuple[int, int]] = []
    current = -first  # day index of the Sunday that opens the first week
    while current <= days_in_month:
        start = max(1, current)
        end = min(days_in_month + 1, current + 7)  # anchor + 7, not start + 7
        if start < end:
            windows.append((start, end))
        current += 7
    return windows


def shifts_per_day_for(result: GenerateScheduleResponse, emp_id: str) -> Dict[int, int]:
    """{day: number_of_shifts_worked_that_day} for one employee."""
    out: Dict[int, int] = {}
    for day, day_sched in result.schedule.days.items():
        n = sum(shift.employee_ids.count(emp_id) for shift in day_sched.shifts)
        if n:
            out[day] = n
    return out


def count_soft_violations(
    result: GenerateScheduleResponse, scenario: Scenario
) -> Dict[str, int]:
    """Count how many AVOID/PREFER (soft) constraints were violated. Handy for
    asserting an UPPER BOUND in a scenario where you know the optimum, but not
    part of the always-on hard checks."""
    assign = assignments_by_day_shift(result)
    avoided = preferred = 0
    for c in scenario.constraints:
        assigned = c.employee_id in assign.get((c.date, c.shift_index), [])
        if c.type == ConstraintType.AVOID and assigned:
            avoided += 1
        elif c.type == ConstraintType.PREFER and not assigned:
            preferred += 1
    return {"avoid_violated": avoided, "prefer_violated": preferred}


# ---------------------------------------------------------------------------
# Hard-constraint invariant checks. Each raises AssertionError with a precise
# message on the first violation it finds.
# ---------------------------------------------------------------------------

def assert_feasible(result: GenerateScheduleResponse) -> None:
    assert result.success is True, (
        f"expected a feasible schedule but solver failed: "
        f"status={result.metadata.solver_status}, message={result.message!r}"
    )
    assert result.metadata.solver_status in ("OPTIMAL", "FEASIBLE"), (
        f"unexpected solver status: {result.metadata.solver_status}"
    )
    assert result.schedule.days, "feasible result but the schedule is empty"


def check_exact_staffing(result: GenerateScheduleResponse, scenario: Scenario) -> None:
    s = scenario.settings
    valid_ids = {e.id for e in scenario.employees}
    for day in range(1, scenario.days_in_month + 1):
        assert day in result.schedule.days, f"day {day} missing from schedule"
        shifts = result.schedule.days[day].shifts
        assert len(shifts) == s.shifts_per_day, (
            f"day {day}: expected {s.shifts_per_day} shifts, got {len(shifts)}"
        )
        for shift_idx, shift in enumerate(shifts):
            ids = shift.employee_ids
            need = s.persons_per_shift[shift_idx]
            assert len(ids) == need, (
                f"day {day} shift {shift_idx}: expected exactly {need} staff, "
                f"got {len(ids)} ({ids})"
            )
            assert len(set(ids)) == len(ids), (
                f"day {day} shift {shift_idx}: duplicate employee in one shift ({ids})"
            )
            unknown = set(ids) - valid_ids
            assert not unknown, f"day {day} shift {shift_idx}: unknown ids {unknown}"


def check_monthly_bounds(result: GenerateScheduleResponse, scenario: Scenario) -> None:
    for emp in scenario.employees:
        n = shift_count(result, emp.id)
        lo, hi = emp.shifts_per_month
        assert lo <= n <= hi, (
            f"{emp.name}: monthly shifts {n} outside [{lo}, {hi}]"
        )


def check_weekday_weekend_bounds(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    for emp in scenario.employees:
        wd, we = weekday_weekend_counts(result, emp.id, scenario.month, scenario.year)
        wd_lo, wd_hi = emp.weekday_shifts
        we_lo, we_hi = emp.weekend_shifts
        assert wd_lo <= wd <= wd_hi, (
            f"{emp.name}: weekday shifts {wd} outside [{wd_lo}, {wd_hi}]"
        )
        assert we_lo <= we <= we_hi, (
            f"{emp.name}: weekend shifts {we} outside [{we_lo}, {we_hi}]"
        )


def check_one_shift_per_day(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    if not scenario.settings.prevent_multiple_shifts_per_day:
        return
    for day, day_sched in result.schedule.days.items():
        seen: Dict[str, int] = {}
        for shift in day_sched.shifts:
            for emp_id in shift.employee_ids:
                seen[emp_id] = seen.get(emp_id, 0) + 1
        offenders = {eid: c for eid, c in seen.items() if c > 1}
        assert not offenders, (
            f"day {day}: employees assigned multiple shifts despite "
            f"prevent_multiple_shifts_per_day: {offenders}"
        )


def check_max_consecutive_days(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    # The solver exempts weekend-type staff from the consecutive-day rule when
    # max_consecutive_days == 1, so only assert it for non weekend-type staff.
    cap = scenario.settings.max_consecutive_days
    for emp in scenario.employees:
        if TAG.WEEKEND in emp.tags:
            continue
        streak = longest_streak(days_worked(result, emp.id))
        assert streak <= cap, (
            f"{emp.name}: works {streak} consecutive days, max allowed is {cap}"
        )


def check_min_rest_days(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    rest = scenario.settings.min_rest_days_between_shifts
    if rest <= 0:
        return
    # Weekend-type staff get a Sat->Sun exemption, so skip them here.
    for emp in scenario.employees:
        if TAG.WEEKEND in emp.tags:
            continue
        worked = days_worked(result, emp.id)
        for prev, cur in zip(worked, worked[1:]):
            gap = cur - prev - 1
            assert gap >= rest, (
                f"{emp.name}: only {gap} rest day(s) between day {prev} and "
                f"day {cur}, needs at least {rest}"
            )


def check_rookie_veteran_caps(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    rookies = {e.id for e in scenario.employees if TAG.ROOKIE in e.tags}
    veterans = {e.id for e in scenario.employees if TAG.VETERAN in e.tags}
    for (day, shift_idx), ids in assignments_by_day_shift(result).items():
        n_rookie = sum(1 for i in ids if i in rookies)
        n_vet = sum(1 for i in ids if i in veterans)
        assert n_rookie <= 1, (
            f"day {day} shift {shift_idx}: {n_rookie} rookies in one shift (max 1)"
        )
        assert n_vet <= 1, (
            f"day {day} shift {shift_idx}: {n_vet} veterans in one shift (max 1)"
        )


def check_max_shifts_per_week(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    # The solver only enforces a cap when max_shifts_per_week < 7. We verify it
    # against the CORRECT (non-overlapping) week partition, so this check keeps
    # passing once the solver's week-partition bug is fixed.
    cap = scenario.settings.max_shifts_per_week
    if cap >= 7:
        return
    windows = correct_weekly_windows(
        scenario.days_in_month, scenario.month, scenario.year
    )
    for emp in scenario.employees:
        by_day = shifts_per_day_for(result, emp.id)
        for start, end in windows:
            total = sum(by_day.get(day, 0) for day in range(start, end))
            assert total <= cap, (
                f"{emp.name}: {total} shifts in week [{start}, {end}) exceeds "
                f"max_shifts_per_week={cap}"
            )


# The full battery, in a readable order.
HARD_CONSTRAINT_CHECKS = (
    check_exact_staffing,
    check_monthly_bounds,
    check_weekday_weekend_bounds,
    check_one_shift_per_day,
    check_max_consecutive_days,
    check_min_rest_days,
    check_rookie_veteran_caps,
    check_max_shifts_per_week,
)


def assert_hard_constraints(
    result: GenerateScheduleResponse, scenario: Scenario
) -> None:
    """Run every hard-constraint check against a feasible result."""
    for check in HARD_CONSTRAINT_CHECKS:
        check(result, scenario)


def assert_scenario(scenario: Scenario) -> GenerateScheduleResponse:
    """Solve a scenario and assert it matches its declared expectation.

    * expect_feasible=True  -> must solve AND obey every hard constraint.
    * expect_feasible=False -> solver must report it cannot be solved.

    Returns the response so a test can make extra scenario-specific assertions.
    """
    result = run_scenario(scenario)
    if scenario.expect_feasible:
        assert_feasible(result)
        assert_hard_constraints(result, scenario)
    else:
        assert result.success is False, (
            f"expected scenario {scenario.id!r} to be infeasible, but it solved "
            f"(status={result.metadata.solver_status})"
        )
    return result
