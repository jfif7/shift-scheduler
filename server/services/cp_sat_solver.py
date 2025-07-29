"""
CP-SAT solver implementation for employee scheduling
"""

from ortools.sat.python import cp_model
from typing import Dict, List, Optional, Tuple, Union
import time

from models.schedule_models import (
    Employee,
    Constraint,
    ScheduleSettings,
    Schedule,
    DaySchedule,
    ShiftAssignment,
    SolverMetadata,
    GenerateScheduleResponse,
    ConstraintType,
)
from utils.date_utils import get_days_in_month, is_weekend, get_first_day_of_month


class ScheduleSolver:
    """CP-SAT based employee scheduling solver"""

    def __init__(self) -> None:
        self.model: cp_model.CpModel = cp_model.CpModel()
        self.solver: cp_model.CpSolver = cp_model.CpSolver()
        self.work_shifts: Dict[int, Dict[int, Dict[int, cp_model.IntVar]]] = {}
        self.work_days: Dict[int, Dict[int, cp_model.IntVar]] = {}
        self.objective_terms: List[Union[cp_model.IntVar, cp_model.LinearExpr]] = []

    def solve_schedule(
        self,
        employees: List[Employee],
        constraints: List[Constraint],
        settings: ScheduleSettings,
        month: int,
        year: int,
        timeout: int = 30,
    ) -> GenerateScheduleResponse:
        """
        Solve the scheduling problem using CP-SAT.

        Args:
            employees: List of employees
            constraints: List of constraints
            settings: Schedule settings
            month: Month (0-11)
            year: Year
            timeout: Timeout in seconds

        Returns:
            Generated schedule response
        """
        start_time: float = time.time()

        try:
            if not employees:
                return GenerateScheduleResponse(
                    success=False,
                    schedule=Schedule(),
                    metadata=SolverMetadata(
                        solver_status="INVALID_INPUT",
                        solve_time=0.0,
                        objective_value=-1,
                        constraints_satisfied=False,
                    ),
                    message="No employees provided",
                )

            # Initialize solver state
            days_in_month = get_days_in_month(month, year)
            self.objective_terms = []  # Initialize objective terms list

            # Check feasibility
            feasibility_check: Tuple[bool, str] = self._check_feasibility(
                employees, settings, days_in_month
            )
            if not feasibility_check[0]:
                return GenerateScheduleResponse(
                    success=False,
                    schedule=Schedule(),
                    metadata=SolverMetadata(
                        solver_status="INFEASIBLE",
                        solve_time=time.time() - start_time,
                        objective_value=-1,
                        constraints_satisfied=False,
                    ),
                    message=feasibility_check[1],
                )

            # Create and solve model
            self.model = cp_model.CpModel()
            self._create_variables(employees, settings, days_in_month)
            self._add_constraints(
                employees, constraints, settings, month, year, days_in_month
            )
            objective: Optional[cp_model.LinearExpr] = self._create_objective(
                employees, settings, days_in_month, month, year
            )

            if objective is not None:
                self.model.Maximize(objective)

            # Solve
            self.solver = cp_model.CpSolver()
            self.solver.parameters.max_time_in_seconds = timeout

            status = self.solver.Solve(self.model)
            solve_time: float = time.time() - start_time

            # Process results
            if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
                schedule: Schedule = self._extract_schedule(
                    employees, settings, days_in_month
                )
                return GenerateScheduleResponse(
                    success=True,
                    schedule=schedule,
                    metadata=SolverMetadata(
                        solver_status=(
                            "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE"
                        ),
                        solve_time=solve_time,
                        objective_value=(
                            int(self.solver.ObjectiveValue())
                            if self.solver.ObjectiveValue()
                            else 0
                        ),
                        constraints_satisfied=True,
                    ),
                    message=f"Schedule generated successfully in {solve_time:.2f} seconds",
                )
            else:
                status_name = {
                    cp_model.INFEASIBLE: "INFEASIBLE",
                    cp_model.MODEL_INVALID: "MODEL_INVALID",
                    cp_model.UNKNOWN: "TIMEOUT",
                }.get(status, "UNKNOWN")

                return GenerateScheduleResponse(
                    success=False,
                    schedule=Schedule(),
                    metadata=SolverMetadata(
                        solver_status=status_name,
                        solve_time=solve_time,
                        objective_value=-1,
                        constraints_satisfied=False,
                    ),
                    message=f"Could not find feasible solution: {status_name}",
                )

        except Exception as e:
            return GenerateScheduleResponse(
                success=False,
                schedule=Schedule(),
                metadata=SolverMetadata(
                    solver_status="ERROR",
                    solve_time=time.time() - start_time,
                    objective_value=-1,
                    constraints_satisfied=False,
                ),
                message=f"Solver error: {str(e)}",
            )

    def _check_feasibility(
        self, employees: List[Employee], settings: ScheduleSettings, days_in_month: int
    ) -> Tuple[bool, str]:
        """Check if the problem is feasible"""

        # Check if we have enough total capacity
        total_shifts_needed = sum(settings.persons_per_shift) * days_in_month

        total_min_shifts: int = sum(emp.shifts_per_month[0] for emp in employees)
        total_max_shifts: int = sum(emp.shifts_per_month[1] for emp in employees)

        if total_max_shifts < total_shifts_needed:
            return (
                False,
                f"Not enough maximum capacity: need {total_shifts_needed}, have {total_max_shifts}",
            )

        if total_min_shifts > total_shifts_needed:
            return (
                False,
                f"Minimum shifts exceed requirement: min {total_min_shifts}, need {total_shifts_needed}",
            )

        return True, "Feasible"

    def _create_variables(
        self, employees: List[Employee], settings: ScheduleSettings, days_in_month: int
    ) -> None:
        """Create decision variables"""
        self.work_shifts = {}
        self.work_days = {}

        for emp_idx, _ in enumerate(employees):
            self.work_shifts[emp_idx] = {}
            self.work_days[emp_idx] = {}
            for day in range(1, days_in_month + 1):
                self.work_shifts[emp_idx][day] = {}
                day_working = self.model.NewBoolVar(f"emp_{emp_idx}_working_day_{day}")
                self.work_days[emp_idx][day] = day_working
                works = []
                for shift in range(settings.shifts_per_day):
                    work = self.model.NewBoolVar(
                        f"emp_{emp_idx}_day_{day}_shift_{shift}"
                    )
                    self.work_shifts[emp_idx][day][shift] = work
                    works.append(work)
                self.model.Add(sum(works) >= 1).OnlyEnforceIf(day_working)
                self.model.Add(sum(works) == 0).OnlyEnforceIf(day_working.Not())

    def _add_constraints(
        self,
        employees: List[Employee],
        constraints: List[Constraint],
        settings: ScheduleSettings,
        month: int,
        year: int,
        days_in_month: int,
    ) -> None:
        """
        Add constraints to the model

         // Penalty weights
        const PENALTY = {
            // Global
            MAX_CONSECUTIVE_SHIFTS: 100, //TODO
            MAX_CONSECUTIVE_DAYS: 100,
            ENOUGH_REST_DAYS: 100,
            MULTIPLE_SHIFTS_PER_DAY: 100,
            MIN_WEEK_SHIFT: 100,
            MAX_WEEK_SHIFT: 100,
            WEEKEND_IMBALANCE: 100,
            ROOKIE_TAG: 100, //TODO
            VETERAN_TAG: 100, //TODO
            WEEKEND_SHIFT_TAG: 100, //TODO
            // Individual
            TOTAL_SHIFT_COUNT: 100,
            WEEKDAY_SHIFT_COUNT: 100,
            WEEKEND_SHIFT_COUNT: 100,
            AVOID_VIOLATION: 100,
            PREFER_VIOLATION: 10,
            // experimental
            HUMAN: 1,
        } as const
        """

        # Persons per shift
        for day in range(1, days_in_month + 1):
            for shift in range(settings.shifts_per_day):
                required_persons: int = settings.persons_per_shift[shift]
                shift_workers = [
                    self.work_shifts[emp_idx][day][shift]
                    for emp_idx in range(len(employees))
                ]
                self.model.Add(sum(shift_workers) == required_persons)

        # shift limits per month
        for emp_idx, emp in enumerate(employees):
            weekday_shifts = []
            weekend_shifts = []
            all_shifts = []

            for day in range(1, days_in_month + 1):
                day_shifts = [
                    self.work_shifts[emp_idx][day][shift]
                    for shift in range(settings.shifts_per_day)
                ]
                all_shifts.extend(day_shifts)
                if is_weekend(day, month, year):
                    weekend_shifts.extend(day_shifts)
                else:
                    weekday_shifts.extend(day_shifts)

            self.model.Add(sum(all_shifts) >= emp.shifts_per_month[0])
            self.model.Add(sum(all_shifts) <= emp.shifts_per_month[1])

            if weekday_shifts:
                self.model.Add(sum(weekday_shifts) >= emp.weekday_shifts[0])
                self.model.Add(sum(weekday_shifts) <= emp.weekday_shifts[1])

            if weekend_shifts:
                self.model.Add(sum(weekend_shifts) >= emp.weekend_shifts[0])
                self.model.Add(sum(weekend_shifts) <= emp.weekend_shifts[1])

        # Prevent multiple shifts per day (if enabled)
        if settings.prevent_multiple_shifts_per_day:
            for emp_idx in range(len(employees)):
                for day in range(1, days_in_month + 1):
                    day_shifts = [
                        self.work_shifts[emp_idx][day][shift]
                        for shift in range(settings.shifts_per_day)
                    ]
                    self.model.Add(sum(day_shifts) <= 1)

        # Maximum consecutive working days
        for emp_idx in range(len(employees)):
            for start_day in range(
                1, days_in_month - settings.max_consecutive_days + 1
            ):
                consecutive_days = []
                for day in range(
                    start_day, start_day + settings.max_consecutive_days + 1
                ):
                    day_working = self.work_days[emp_idx][day]
                    consecutive_days.append(day_working)

                # Don't allow more than max_consecutive_days in a row
                self.model.Add(sum(consecutive_days) <= settings.max_consecutive_days)

        # Weekly shift limits
        if settings.max_shifts_per_week != 0 or settings.min_shifts_per_week != 0:
            self._add_weekly_limits(employees, settings, days_in_month, month, year)

        # Minimum rest days between shifts
        if settings.min_rest_days_between_shifts > 0:
            self._add_rest_day_constraints(employees, settings, days_in_month)

        # Employee preferences and constraints
        self._add_preference_constraints(
            employees, constraints, settings, days_in_month
        )

    def _add_weekly_limits(
        self,
        employees: List[Employee],
        settings: ScheduleSettings,
        days_in_month: int,
        month: int,
        year: int,
    ) -> None:
        """Add weekly shift limit constraints"""
        for emp_idx in range(len(employees)):
            # Get the day of week for the 1st of the month (0=Monday, 6=Sunday)
            first_day_of_month = get_first_day_of_month(month, year)

            # Calculate proper week boundaries based on actual calendar weeks
            # We'll consider Sunday as the start of the week
            current_day = -first_day_of_month

            while current_day <= days_in_month:
                # [week_start, weekend)
                week_start = max(1, current_day)
                week_end = min(days_in_month + 1, week_start + 7)

                week_shifts = [
                    self.work_shifts[emp_idx][day][shift]
                    for day in range(week_start, week_end)
                    for shift in range(settings.shifts_per_day)
                ]
                if settings.max_shifts_per_week < 7:
                    self.model.Add(sum(week_shifts) <= settings.max_shifts_per_week)
                if settings.min_shifts_per_week > 0:
                    self.model.Add(sum(week_shifts) >= settings.min_shifts_per_week)

                current_day = current_day + 7

    def _add_rest_day_constraints(
        self, employees: List[Employee], settings: ScheduleSettings, days_in_month: int
    ) -> None:
        """Add minimum rest day constraints between shifts"""
        for emp_idx in range(len(employees)):
            for day in range(1, days_in_month):
                today_working = self.work_days[emp_idx][day]
                for rest_day in range(1, settings.min_rest_days_between_shifts + 1):
                    next_day = day + rest_day
                    if next_day <= days_in_month:
                        next_day_working = self.work_days[emp_idx][next_day]
                        # If working today, cannot work on rest day
                        self.model.AddImplication(today_working, next_day_working.Not())
                    else:
                        break

    def _add_preference_constraints(
        self,
        employees: List[Employee],
        constraints: List[Constraint],
        settings: ScheduleSettings,
        days_in_month: int,
    ) -> None:
        """Add preference constraints based on employee constraints"""
        id_to_idx = {emp.id: i for i, emp in enumerate(employees)}
        for constraint in constraints:
            if constraint.employee_id not in id_to_idx:
                continue
            emp_idx = id_to_idx[constraint.employee_id]

            day = constraint.date
            if day > days_in_month:
                continue

            shift_idx = constraint.shift_index
            if shift_idx >= settings.shifts_per_day:
                continue

            # Get the specific shift variable
            shift_var: cp_model.IntVar = self.work_shifts[emp_idx][day][shift_idx]

            w = settings.preference_weight

            if constraint.type == ConstraintType.AVOID:
                # Soft constraint to avoid these shifts
                self.objective_terms.append(shift_var * (-10 * w))

            elif constraint.type == ConstraintType.PREFER:
                # Soft constraint to prefer these shifts
                self.objective_terms.append(shift_var * (5 * w))

    def _create_objective(
        self,
        employees: List[Employee],
        settings: ScheduleSettings,
        days_in_month: int,
        month: int,
        year: int,
    ) -> Optional[cp_model.LinearExpr]:
        """Create enhanced objective function with multiple optimization goals"""

        # Weekend imbalance minimization
        if settings.even_distribution and settings.fairness_weight > 0:
            self._add_weekend_imbalance_objective(
                employees, settings, days_in_month, month, year
            )

        # Return the sum of all objective terms
        if self.objective_terms:
            return sum(self.objective_terms)
        else:
            return None

    def _add_weekend_imbalance_objective(
        self,
        employees: List[Employee],
        settings: ScheduleSettings,
        days_in_month: int,
        month: int,
        year: int,
    ) -> None:
        """Add objective terms to minimize weekend score imbalance"""

        if len(employees) <= 1:
            return

        # Calculate weekend scores for each employee
        weekend_scores = []
        first_day_of_month = get_first_day_of_month(month, year)
        total_w = 0
        w_per_day = sum(settings.persons_per_shift)

        for emp_idx in range(len(employees)):

            weekend_shifts = []
            for day in range(1, days_in_month + 1):
                # Get day of week (0=Monday, 6=Sunday)
                day_of_week = (first_day_of_month + day - 1) % 7

                if day_of_week == 4:  # Friday
                    weight = 1
                    total_w += w_per_day
                elif day_of_week in [5, 6]:  # Saturday, Sunday
                    weight = 2
                    total_w += 2 * w_per_day
                else:
                    continue  # Skip non-weekend days

                # Sum all shifts for this day, weighted by weekend importance
                day_shifts_sum = sum(
                    self.work_shifts[emp_idx][day][shift]
                    for shift in range(settings.shifts_per_day)
                )
                weekend_shifts.append(day_shifts_sum * weight)

            weekend_scores.append(sum(weekend_shifts))

        # Calculate mean (we'll work with total * num_employees to avoid division)
        num_employees = len(employees)

        for emp_idx, score in enumerate(weekend_scores):
            # For each employee, calculate |score * num_employees - total_score|
            # This is equivalent to |score - mean| * num_employees
            deviation = self.model.NewIntVar(
                0, 1000 * num_employees, f"deviation_{emp_idx}"
            )

            # Take absolute value: deviation = |diff|
            self.model.AddAbsEquality(deviation, score * num_employees - total_w)
            self.objective_terms.append(deviation * (-settings.fairness_weight))

    def _extract_schedule(
        self,
        employees: List[Employee],
        settings: ScheduleSettings,
        days_in_month: int,
    ) -> Schedule:
        """Extract the schedule from the solved model"""
        schedule_days = {}

        for day in range(1, days_in_month + 1):
            shifts = []
            for shift in range(settings.shifts_per_day):
                employee_ids = []
                for emp_idx, emp in enumerate(employees):
                    if self.solver.Value(self.work_shifts[emp_idx][day][shift]):
                        employee_ids.append(emp.id)

                shifts.append(ShiftAssignment(employee_ids=employee_ids))

            schedule_days[day] = DaySchedule(shifts=shifts)

        return Schedule(days=schedule_days)
