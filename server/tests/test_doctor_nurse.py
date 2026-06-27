"""
Doctor & Nurse scheduling scenarios for the CP-SAT backend solver.
==================================================================

These mirror the two demo datasets the app ships (``範例 - 醫生`` and
``範例 - 護理師``): same team sizes, same per-employee bounds, same settings.
Each scenario is solved and then checked against EVERY hard constraint the
solver guarantees (see scenario_framework.HARD_CONSTRAINT_CHECKS).

------------------------------------------------------------------
HOW TO ADD YOUR OWN TEST CASE
------------------------------------------------------------------
1. Build a Scenario(...) using the helpers from scenario_framework:
   make_employee / make_team / make_settings / avoid / prefer.
2. Append it to DOCTOR_SCENARIOS or NURSE_SCENARIOS (or make a new list).
3. That's it -- it is picked up automatically and fully checked.

   * Set expect_feasible=False to assert the solver REJECTS an impossible setup.
   * For SOFT (avoid/prefer) expectations, add a dedicated test that calls
     count_soft_violations(result, scenario) -- see the soft-constraint tests
     at the bottom for the pattern.
"""

import pytest

from services.cp_sat_solver import TAG, ScheduleSolver, check_settings_compliance
from tests.scenario_framework import (
    Scenario,
    make_employee,
    make_team,
    make_settings,
    avoid,
    prefer,
    assert_scenario,
    run_scenario,
    assert_feasible,
    assert_hard_constraints,
    count_soft_violations,
    assignments_by_day_shift,
    shift_count,
    correct_weekly_windows,
    check_exact_staffing,
    check_monthly_bounds,
    check_one_shift_per_day,
    check_rookie_veteran_caps,
    check_regime_offday_windows,
    check_regime_consecutive_ceiling,
)

# The demos are scheduled for August 2025 (month is 0-based, so 7 = August).
AUGUST = 7
YEAR = 2025


# ===========================================================================
# DOCTOR scenarios  (範例 - 醫生)
# ---------------------------------------------------------------------------
# 7 doctors, one day-shift staffed by 2 people, every day. Each doctor works
# 6-11 shifts/month with >=2 rest days between shifts and never two days in a
# row. One doctor is "weekend-type", two are veterans.
# ===========================================================================

def _doctor_scenario() -> Scenario:
    deng = make_employee("燈", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8),
                         tags=[TAG.VETERAN])
    aine = make_employee("愛音", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8),
                         tags=[TAG.WEEKEND, TAG.VETERAN])
    rana = make_employee("樂奈", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8))
    soyo = make_employee("爽世", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8))
    rikki = make_employee("立希", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8))
    mutsumi = make_employee("睦", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8))
    saki = make_employee("祥子", shifts=(6, 11), weekday=(0, 8), weekend=(0, 8))

    employees = [deng, aine, rana, soyo, rikki, mutsumi, saki]

    constraints = [
        avoid(saki, 4), avoid(saki, 11), avoid(saki, 18), avoid(saki, 25),
        prefer(aine, 3), prefer(aine, 2),
        avoid(rana, 5), avoid(rana, 12), avoid(rana, 19), avoid(rana, 26),
        avoid(deng, 9), avoid(deng, 10), avoid(deng, 3),
        avoid(rikki, 9), avoid(rikki, 25), avoid(rikki, 26),
        avoid(rikki, 27), avoid(rikki, 28),
        avoid(mutsumi, 6), avoid(mutsumi, 13), avoid(mutsumi, 20), avoid(mutsumi, 27),
    ]

    settings = make_settings(
        shifts_per_day=1,
        persons_per_shift=[2],
        max_consecutive_shifts=1,
        max_consecutive_days=1,
        min_rest_days_between_shifts=2,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=1,
        even_distribution=True,
    )

    return Scenario(
        id="doctor_demo",
        description="Full 7-doctor August demo with avoid/prefer day requests.",
        employees=employees,
        settings=settings,
        constraints=constraints,
        month=AUGUST,
        year=YEAR,
        timeout=30,
    )


def _doctor_no_constraints_scenario() -> Scenario:
    """Same doctor team & settings but no day-off requests -- a clean check that
    the structural constraints alone are satisfiable."""
    s = _doctor_scenario()
    return Scenario(
        id="doctor_structure_only",
        description="7-doctor August demo, structural constraints only.",
        employees=s.employees,
        settings=s.settings,
        constraints=[],
        month=AUGUST,
        year=YEAR,
        timeout=30,
    )


DOCTOR_SCENARIOS = [
    _doctor_no_constraints_scenario(),
    _doctor_scenario(),
]


# ===========================================================================
# NURSE scenarios  (範例 - 護理師)
# ---------------------------------------------------------------------------
# 20 nurses, three shifts/day staffed [6, 4, 3] (day / evening / night). Each
# nurse works 15-22 shifts/month, up to 6 consecutive days, one shift per day.
# One rookie and two veterans (capped at one each per shift).
# ===========================================================================

def _nurse_team():
    # Demo tag layout: veteran, rookie, veteran among the 20 nurses.
    return make_team(
        20,
        name_prefix="Nurse",
        shifts=(15, 22),
        weekday=(0, 16),
        weekend=(0, 8),
        tags_by_index={7: [TAG.VETERAN], 16: [TAG.ROOKIE], 19: [TAG.VETERAN]},
    )


def _nurse_settings():
    return make_settings(
        shifts_per_day=3,
        persons_per_shift=[6, 4, 3],
        max_consecutive_shifts=1,
        max_consecutive_days=6,
        min_rest_days_between_shifts=0,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=1,
        even_distribution=True,
    )


def _nurse_structure_scenario() -> Scenario:
    return Scenario(
        id="nurse_structure_only",
        description="20-nurse August demo (3 shifts [6,4,3]), structural only.",
        employees=_nurse_team(),
        settings=_nurse_settings(),
        constraints=[],
        month=AUGUST,
        year=YEAR,
        timeout=45,
    )


def _nurse_with_requests_scenario() -> Scenario:
    nurses = _nurse_team()
    # Representative day-off requests (the shipped demo has ~1200 of these;
    # a compact, readable subset exercises the same code path):
    #  - Nurse01 cannot take the day shift for the first ten days
    #  - Nurse02 prefers the night shift on a few dates
    constraints = (
        [avoid(nurses[0], day, 0) for day in range(1, 11)]
        + [prefer(nurses[1], day, 2) for day in (5, 12, 19, 26)]
    )
    return Scenario(
        id="nurse_with_requests",
        description="20-nurse demo with a readable subset of shift requests.",
        employees=nurses,
        settings=_nurse_settings(),
        constraints=constraints,
        month=AUGUST,
        year=YEAR,
        timeout=45,
    )


NURSE_SCENARIOS = [
    _nurse_structure_scenario(),
    _nurse_with_requests_scenario(),
]


# ===========================================================================
# EDGE scenarios -- show how to assert the solver REJECTS the impossible.
# ===========================================================================

def _impossible_capacity_scenario() -> Scenario:
    # 2 doctors can supply at most 2*31 = 62 shifts, but a single shift needing
    # 3 people every day requires 93 -- not enough capacity.
    employees = make_team(2, name_prefix="Doc", shifts=(0, 31),
                          weekday=(0, 31), weekend=(0, 31))
    return Scenario(
        id="impossible_not_enough_staff",
        description="3 people/shift but only 2 staff -- must be infeasible.",
        employees=employees,
        settings=make_settings(shifts_per_day=1, persons_per_shift=[3]),
        month=AUGUST,
        year=YEAR,
        expect_feasible=False,
    )


EDGE_SCENARIOS = [
    _impossible_capacity_scenario(),
]


# ===========================================================================
# Tests
# ===========================================================================

@pytest.mark.parametrize("scenario", DOCTOR_SCENARIOS, ids=lambda s: s.id)
def test_doctor_scenarios(scenario):
    assert_scenario(scenario)


@pytest.mark.parametrize("scenario", NURSE_SCENARIOS, ids=lambda s: s.id)
def test_nurse_scenarios(scenario):
    assert_scenario(scenario)


@pytest.mark.parametrize("scenario", EDGE_SCENARIOS, ids=lambda s: s.id)
def test_edge_scenarios(scenario):
    assert_scenario(scenario)


# --- Soft (avoid / prefer) constraints -------------------------------------
# These are objective terms, not hard guarantees, so they get their own tests
# built around a setup where honouring the request is strictly optimal.

def test_prefer_is_honoured_when_it_is_free():
    """With nothing competing, the solver should grant a PREFER request."""
    team = make_team(3, name_prefix="P", shifts=(0, 28),
                     weekday=(0, 28), weekend=(0, 28))
    scenario = Scenario(
        id="prefer_free",
        description="One prefer request, no competing objective.",
        employees=team,
        settings=make_settings(shifts_per_day=1, persons_per_shift=[1],
                               even_distribution=False, preference_weight=10),
        constraints=[prefer(team[0], 1, 0)],
        month=1,  # February 2025
        year=2025,
    )
    result = assert_scenario(scenario)
    assert team[0].id in assignments_by_day_shift(result)[(1, 0)], (
        "prefer request should have been honoured when it was free to do so"
    )
    assert count_soft_violations(result, scenario)["prefer_violated"] == 0


def test_avoid_is_honoured_when_it_is_free():
    """With nothing competing, the solver should respect an AVOID request."""
    team = make_team(3, name_prefix="A", shifts=(0, 28),
                     weekday=(0, 28), weekend=(0, 28))
    scenario = Scenario(
        id="avoid_free",
        description="One avoid request, no competing objective.",
        employees=team,
        settings=make_settings(shifts_per_day=1, persons_per_shift=[1],
                               even_distribution=False, preference_weight=10),
        constraints=[avoid(team[0], 5, 0)],
        month=1,  # February 2025
        year=2025,
    )
    result = assert_scenario(scenario)
    assert team[0].id not in assignments_by_day_shift(result)[(5, 0)], (
        "avoid request should have been honoured when it was free to do so"
    )
    assert count_soft_violations(result, scenario)["avoid_violated"] == 0


# --- Framework self-checks --------------------------------------------------
# Prove the invariant checkers actually fail on bad data (the old suite's
# assertions were tautologies that could never fail; these cannot rot the same
# way). We hand-build deliberately broken results and assert the checker bites.

def _fake_result(days):
    from models.schedule_models import (
        GenerateScheduleResponse, Schedule, DaySchedule, ShiftAssignment,
        SolverMetadata,
    )
    schedule = Schedule(days={
        day: DaySchedule(shifts=[ShiftAssignment(employee_ids=list(ids))
                                 for ids in shifts])
        for day, shifts in days.items()
    })
    return GenerateScheduleResponse(
        success=True,
        schedule=schedule,
        metadata=SolverMetadata(solver_status="OPTIMAL", solve_time=0.0,
                                objective_value=0, constraints_satisfied=True),
        message="fake",
    )


def test_selfcheck_exact_staffing_detects_wrong_count():
    scenario = Scenario(
        id="sc", description="", employees=make_team(3, name_prefix="E",
        shifts=(0, 31), weekday=(0, 31), weekend=(0, 31)),
        settings=make_settings(shifts_per_day=1, persons_per_shift=[2]),
        month=AUGUST, year=YEAR,
    )
    # Day 1 has only 1 person but the shift needs 2.
    bad = _fake_result({d: [[scenario.employees[0].id, scenario.employees[1].id]]
                        for d in range(1, scenario.days_in_month + 1)})
    bad.schedule.days[1].shifts[0].employee_ids = [scenario.employees[0].id]
    with pytest.raises(AssertionError, match="expected exactly 2 staff"):
        check_exact_staffing(bad, scenario)


def test_selfcheck_rookie_veteran_cap_detects_two_rookies():
    rookies = make_team(2, name_prefix="R", shifts=(0, 31), weekday=(0, 31),
                        weekend=(0, 31), tags_by_index={0: [TAG.ROOKIE],
                                                        1: [TAG.ROOKIE]})
    scenario = Scenario(
        id="sc", description="", employees=rookies,
        settings=make_settings(shifts_per_day=1, persons_per_shift=[2]),
        month=AUGUST, year=YEAR,
    )
    bad = _fake_result({1: [[rookies[0].id, rookies[1].id]]})
    with pytest.raises(AssertionError, match="rookies in one shift"):
        check_rookie_veteran_caps(bad, scenario)


def test_selfcheck_monthly_bounds_detects_overwork():
    emp = make_employee("Solo", shifts=(0, 2))  # max 2 shifts
    scenario = Scenario(
        id="sc", description="", employees=[emp],
        settings=make_settings(shifts_per_day=1, persons_per_shift=[1]),
        month=AUGUST, year=YEAR,
    )
    bad = _fake_result({1: [[emp.id]], 2: [[emp.id]], 3: [[emp.id]]})  # 3 > 2
    with pytest.raises(AssertionError, match="monthly shifts 3 outside"):
        check_monthly_bounds(bad, scenario)


def test_selfcheck_one_shift_per_day_detects_double_booking():
    emp = make_employee("Busy", shifts=(0, 31))
    scenario = Scenario(
        id="sc", description="", employees=[emp],
        settings=make_settings(shifts_per_day=2, persons_per_shift=[1, 1]),
        month=AUGUST, year=YEAR,
    )
    bad = _fake_result({1: [[emp.id], [emp.id]]})  # same person, both shifts
    with pytest.raises(AssertionError, match="multiple shifts"):
        check_one_shift_per_day(bad, scenario)


# --- Weekly week-partition --------------------------------------------------
# The solver's weekly limits use a Sunday-anchored partition. The checker baked
# into the hard battery verifies max_shifts_per_week against this partition; the
# two tests below pin the week boundaries themselves so the partition can never
# regress back to overlapping windows.

def test_correct_weekly_windows_partition_the_month_exactly_once():
    """The partition covers every day exactly once (no gaps, no overlaps)."""
    windows = correct_weekly_windows(31, AUGUST, YEAR)  # August 2025
    covered = [day for start, end in windows for day in range(start, end)]
    assert covered == list(range(1, 32)), (
        f"weeks should tile days 1..31 once; got {windows}"
    )


def test_weekly_windows_match_intended_sunday_partition():
    """The solver's week windows are the non-overlapping Sunday-anchored
    partition (regression guard for the first-partial-week boundary)."""
    solver = ScheduleSolver()
    days, month, year = 31, AUGUST, YEAR  # August 2025 starts on a Friday
    assert solver._weekly_windows(days, month, year) == correct_weekly_windows(
        days, month, year
    )


# ===========================================================================
# Taiwan labor-law (勞動基準法) day-based regimes
# ---------------------------------------------------------------------------
# A regime is a hard floor enforced for every employee. The two regime checkers
# are in the hard battery, so any scenario with labor_regime set is verified
# against its rolling off-day windows + consecutive-day ceiling automatically.
#   standard           -> 一例一休: >=2 days off / rolling 7 days (<=5 consec)
#   four_week_flexible -> 四週變形: >=2 off/14d, >=8 off/28d (<=12 consec)
# ===========================================================================

def _doctor_standard_regime() -> Scenario:
    base = _doctor_scenario()
    return Scenario(
        id="doctor_standard_regime",
        description="Doctor demo under the standard 一例一休 regime.",
        employees=base.employees,
        settings=base.settings.model_copy(update={"labor_regime": "standard"}),
        constraints=base.constraints,
        month=AUGUST,
        year=YEAR,
        timeout=30,
    )


def _nurse_four_week_regime() -> Scenario:
    return Scenario(
        id="nurse_four_week_regime",
        description="Nurse demo under the 四週變形 regime (medical, <=12 consecutive).",
        employees=_nurse_team(),
        settings=_nurse_settings().model_copy(
            update={"labor_regime": "four_week_flexible"}
        ),
        constraints=[],
        month=AUGUST,
        year=YEAR,
        timeout=60,
    )


def _standard_infeasible_when_overpacked() -> Scenario:
    # 7 staff, one shift needing 6 of them every day -> each works ~6 of every 7
    # days. The standard regime demands >=2 days off per rolling 7 days, i.e.
    # 14 off-slots per 7-day window across the team, but only 7 exist. So a
    # roster that is feasible WITHOUT the regime becomes infeasible WITH it --
    # this is the test that pins the regime constraint actually doing work.
    employees = make_team(7, name_prefix="D", shifts=(0, 31),
                          weekday=(0, 31), weekend=(0, 31))
    return Scenario(
        id="standard_infeasible_when_overpacked",
        description="6-of-7 every day cannot satisfy 一例一休 -> infeasible.",
        employees=employees,
        settings=make_settings(shifts_per_day=1, persons_per_shift=[6],
                               max_consecutive_days=7, labor_regime="standard"),
        month=AUGUST,
        year=YEAR,
        expect_feasible=False,
        timeout=20,
    )


REGIME_SCENARIOS = [
    _doctor_standard_regime(),
    _nurse_four_week_regime(),
    _standard_infeasible_when_overpacked(),
]


@pytest.mark.parametrize("scenario", REGIME_SCENARIOS, ids=lambda s: s.id)
def test_labor_regime_scenarios(scenario):
    assert_scenario(scenario)


def test_settings_compliance_warns_when_looser_than_regime():
    settings = make_settings(shifts_per_day=1, persons_per_shift=[1],
                             max_consecutive_days=7, labor_regime="standard")
    notes = check_settings_compliance(settings)
    assert any("exceeds" in n for n in notes), notes


def test_settings_compliance_is_silent_without_a_regime():
    settings = make_settings(shifts_per_day=1, persons_per_shift=[1],
                             max_consecutive_days=7, labor_regime="none")
    assert check_settings_compliance(settings) == []


def test_selfcheck_regime_offday_window_detects_overwork():
    emp = make_employee("Packed", shifts=(0, 31))
    scenario = Scenario(
        id="sc", description="", employees=[emp],
        settings=make_settings(shifts_per_day=1, persons_per_shift=[1],
                               labor_regime="standard"),
        month=AUGUST, year=YEAR,
    )
    bad = _fake_result({d: [[emp.id]] for d in range(1, 7)})  # 1 off in days 1-7
    with pytest.raises(AssertionError, match="requires >= 2"):
        check_regime_offday_windows(bad, scenario)


def test_selfcheck_regime_consecutive_ceiling_detects_long_streak():
    emp = make_employee("Streak", shifts=(0, 31))
    scenario = Scenario(
        id="sc", description="", employees=[emp],
        settings=make_settings(shifts_per_day=1, persons_per_shift=[1],
                               labor_regime="standard"),
        month=AUGUST, year=YEAR,
    )
    bad = _fake_result({d: [[emp.id]] for d in range(1, 7)})  # 6 consec, cap 5
    with pytest.raises(AssertionError, match="consecutive working days exceeds"):
        check_regime_consecutive_ceiling(bad, scenario)
