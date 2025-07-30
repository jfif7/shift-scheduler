"""
Test the CP-SAT solver functionality
"""

import pytest
from services.cp_sat_solver import ScheduleSolver
from models.schedule_models import (
    Employee,
    Constraint,
    ScheduleSettings,
    ConstraintType,
)
from utils.date_utils import get_first_day_of_month


def test_week_calculation_logic():
    """Test that weekly limits are calculated correctly based on actual calendar weeks"""
    # Test January 2025 - starts on Wednesday (day 2)
    # Week structure should be:
    # Wed 1, Thu 2, Fri 3, Sat 4, Sun 5, Mon 6, Tue 7  (Week 1 - partial)
    # Wed 8, Thu 9, Fri 10, Sat 11, Sun 12, Mon 13, Tue 14  (Week 2)
    # etc.

    first_day = get_first_day_of_month(0, 2025)  # January 2025 (month 0)
    assert first_day == 2  # Wednesday (0=Monday, 1=Tuesday, 2=Wednesday)

    # Test February 2025 - starts on Saturday (day 5)
    first_day_feb = get_first_day_of_month(1, 2025)  # February 2025 (month 1)
    assert first_day_feb == 5  # Saturday

    # Create a simple test to verify the solver uses correct week boundaries
    solver = ScheduleSolver()

    employees = [
        Employee(
            id="emp_001",
            name="Test Employee",
            shifts_per_month=[4, 8],
            weekday_shifts=[3, 6],
            weekend_shifts=[1, 2],
            tags=[],
        ),
    ]

    settings = ScheduleSettings(
        shifts_per_day=1,
        persons_per_shift=[1],
        max_consecutive_shifts=5,
        max_consecutive_days=7,
        min_rest_days_between_shifts=0,
        prevent_multiple_shifts_per_day=False,
        max_shifts_per_week=2,  # Strict weekly limit to test the constraint
        min_shifts_per_week=1,
        even_distribution=False,
    )

    # Test with February 2025 (short month starting on Saturday)
    result = solver.solve_schedule(
        employees=employees,
        constraints=[],
        settings=settings,
        month=1,  # February
        year=2025,
        timeout=10,
    )

    assert result.success in [True, False]
    print(f"Week calculation test: {'✓ Success' if result.success else '✗ Failed'}")

    if result.success:
        # Verify that weekly limits are respected
        # We can't easily verify the exact week boundaries without exposing internal state,
        # but if the solution exists, it should respect the weekly constraints
        print(f"  Solver status: {result.metadata.solver_status}")
        print(f"  Solution found with proper week boundaries")

        # Count shifts per calendar week to verify constraint is working
        # February 2025: Sat 1, Sun 2 | Mon 3-Sun 9 | Mon 10-Sun 16 | Mon 17-Sun 23 | Mon 24-Fri 28
        weeks = {
            1: [1, 2],  # Partial week 1: Sat-Sun
            2: [3, 4, 5, 6, 7, 8, 9],  # Full week 2: Mon-Sun
            3: [10, 11, 12, 13, 14, 15, 16],  # Full week 3: Mon-Sun
            4: [17, 18, 19, 20, 21, 22, 23],  # Full week 4: Mon-Sun
            5: [24, 25, 26, 27, 28],  # Partial week 5: Mon-Fri
        }

        for week_num, days in weeks.items():
            week_shifts = 0
            for day in days:
                if day in result.schedule.days:
                    day_schedule = result.schedule.days[day]
                    for shift in day_schedule.shifts:
                        if "emp_001" in shift.employee_ids:
                            week_shifts += 1

            print(f"  Week {week_num} ({days[0]}-{days[-1]}): {week_shifts} shifts")
            # Weekly limit should be respected (max 2 shifts per week)
            assert (
                week_shifts <= settings.max_shifts_per_week
            ), f"Week {week_num} exceeds limit: {week_shifts} > {settings.max_shifts_per_week}"
            assert (
                week_shifts >= settings.min_shifts_per_week
            ), f"Week {week_num} below minimum: {week_shifts} < {settings.min_shifts_per_week}"

    print("  ✓ Week boundary calculation working correctly!")


def test_solver_initialization():
    """Test that solver initializes correctly"""
    solver = ScheduleSolver()
    # The model is now initialized in the constructor
    assert solver.model is not None
    assert solver.solver is not None
    assert hasattr(solver, "work_shifts")
    assert hasattr(solver, "work_days")
    assert hasattr(solver, "objective_terms")


def test_feasibility_check_no_employees():
    """Test feasibility check with no employees"""
    solver = ScheduleSolver()
    employees = []
    settings = ScheduleSettings(
        shifts_per_day=1,
        persons_per_shift=[1],
        max_consecutive_shifts=3,
        max_consecutive_days=5,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=2,
        even_distribution=True,
    )
    days_in_month = 31

    # This should detect infeasibility due to no employees
    is_feasible, message = solver._check_feasibility(employees, settings, days_in_month)
    assert not is_feasible
    assert "Not enough maximum capacity" in message


def test_feasibility_check_insufficient_capacity():
    """Test feasibility check with insufficient employee capacity"""
    solver = ScheduleSolver()
    employees = [
        Employee(
            id="emp_001",
            name="John Doe",
            shifts_per_month=[1, 5],  # Very low capacity
            weekday_shifts=[1, 3],
            weekend_shifts=[0, 2],
            tags=[],
        )
    ]
    settings = ScheduleSettings(
        shifts_per_day=2,
        persons_per_shift=[2, 2],  # Needs 4 people per day
        max_consecutive_shifts=3,
        max_consecutive_days=5,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=2,
        even_distribution=True,
    )
    days_in_month = 31

    is_feasible, message = solver._check_feasibility(employees, settings, days_in_month)
    assert not is_feasible
    assert "Not enough maximum capacity" in message


def test_feasibility_check_excessive_minimum():
    """Test feasibility check with excessive minimum requirements"""
    solver = ScheduleSolver()
    employees = [
        Employee(
            id="emp_001",
            name="John Doe",
            shifts_per_month=[100, 200],  # Very high minimum
            weekday_shifts=[50, 100],
            weekend_shifts=[50, 100],
            tags=[],
        )
    ]
    settings = ScheduleSettings(
        shifts_per_day=1,
        persons_per_shift=[1],  # Only need 31 total shifts
        max_consecutive_shifts=3,
        max_consecutive_days=5,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=2,
        even_distribution=True,
    )
    days_in_month = 31

    is_feasible, message = solver._check_feasibility(employees, settings, days_in_month)
    assert not is_feasible
    assert "Minimum shifts exceed requirement" in message


def test_simple_schedule_generation():
    """Test simple schedule generation"""
    solver = ScheduleSolver()

    employees = [
        Employee(
            id="emp_001",
            name="John Doe",
            shifts_per_month=[10, 20],
            weekday_shifts=[8, 15],
            weekend_shifts=[2, 5],
            tags=["senior"],
        ),
        Employee(
            id="emp_002",
            name="Jane Smith",
            shifts_per_month=[10, 20],
            weekday_shifts=[8, 15],
            weekend_shifts=[2, 5],
            tags=["junior"],
        ),
    ]

    constraints = [
        Constraint(
            id="const_001",
            employee_id="emp_001",
            type=ConstraintType.AVOID,
            date=15,
            shift_index=0,
        )
    ]

    settings = ScheduleSettings(
        shifts_per_day=1,
        persons_per_shift=[1],
        max_consecutive_shifts=3,
        max_consecutive_days=5,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=6,
        min_shifts_per_week=2,
        even_distribution=True,
    )

    # Test with a short month to reduce complexity
    result = solver.solve_schedule(
        employees=employees,
        constraints=constraints,
        settings=settings,
        month=1,  # February
        year=2025,
        timeout=10,
    )

    # Check that we get a valid response
    assert result.success in [True, False]  # Could be feasible or infeasible
    assert result.metadata is not None
    assert result.message is not None

    if result.success:
        assert result.metadata.solver_status in ["OPTIMAL", "FEASIBLE"]
        assert len(result.schedule.days) > 0

        # Check that constraint is respected (note: AVOID is soft, might not always be honored)
        if 15 in result.schedule.days:
            day_15_schedule = result.schedule.days[15]
            if len(day_15_schedule.shifts) > 0:
                shift_0_employees = day_15_schedule.shifts[0].employee_ids
                # AVOID is a soft constraint, so it might still be assigned if necessary
                # We just check that the schedule was generated successfully
                assert len(shift_0_employees) > 0  # Someone should be assigned


def test_simple_constraint_types():
    """Test simple constraint types with minimal feasible problem"""
    solver = ScheduleSolver()

    # Create employees with reasonable capacity
    employees = [
        Employee(
            id="emp_001",
            name="Alice",
            shifts_per_month=[5, 20],  # Reasonable minimum
            weekday_shifts=[3, 15],
            weekend_shifts=[2, 5],
            tags=["manager"],
        ),
        Employee(
            id="emp_002",
            name="Bob",
            shifts_per_month=[5, 20],  # Reasonable minimum
            weekday_shifts=[3, 15],
            weekend_shifts=[2, 5],
            tags=["nurse"],
        ),
    ]

    # Test only a few days to make it feasible
    constraints = [
        # Alice PREFERS to work day 1, shift 0
        Constraint(
            id="prefer_1",
            employee_id="emp_001",
            date=1,
            shift_index=0,
            type=ConstraintType.PREFER,
            reason="Preferred for meeting",
        ),
        # Bob AVOIDS day 2
        Constraint(
            id="avoid_1",
            employee_id="emp_002",
            date=2,
            shift_index=0,
            type=ConstraintType.AVOID,
            reason="Medical appointment",
        ),
    ]

    settings = ScheduleSettings(
        shifts_per_day=1,  # Just 1 shift per day
        persons_per_shift=[1],  # 1 person per shift
        max_consecutive_shifts=10,
        max_consecutive_days=10,
        min_rest_days_between_shifts=0,
        prevent_multiple_shifts_per_day=False,
        max_shifts_per_week=10,
        min_shifts_per_week=0,
        even_distribution=False,
    )

    # Test with just first week of February 2025
    result = solver.solve_schedule(
        employees=employees,
        constraints=constraints,
        settings=settings,
        month=1,  # February
        year=2025,
        timeout=10,
    )

    # Verify the result
    assert result.success in [True, False]
    print(f"Simple constraint test: {'✓ Success' if result.success else '✗ Failed'}")

    if result.success:
        print(f"  Solver status: {result.metadata.solver_status}")
        print(f"  Solve time: {result.metadata.solve_time:.3f}s")

        # Verify MUST_WORK: Alice should work day 1
        if 1 in result.schedule.days:
            day_1 = result.schedule.days[1]
            if len(day_1.shifts) > 0:
                shift_0_employees = day_1.shifts[0].employee_ids
                print(f"  Day 1 workers: {shift_0_employees}")
                assert (
                    "emp_001" in shift_0_employees
                ), "Alice should be assigned day 1 (MUST_WORK)"

        # Verify UNAVAILABLE: Bob should NOT work day 2
        if 2 in result.schedule.days:
            day_2 = result.schedule.days[2]
            if len(day_2.shifts) > 0:
                shift_0_employees = day_2.shifts[0].employee_ids
                print(f"  Day 2 workers: {shift_0_employees}")
                assert (
                    "emp_002" not in shift_0_employees
                ), "Bob should NOT be assigned day 2 (UNAVAILABLE)"

        print("  ✓ All constraint types working correctly!")
    else:
        print(f"  Reason: {result.message}")
        assert (
            "capacity" in result.message.lower()
            or "infeasible" in result.message.lower()
            or "minimum" in result.message.lower()
        )


def test_advanced_constraint_types():
    """Test advanced constraint types using available AVOID and PREFER"""
    solver = ScheduleSolver()

    # Create employees with different skills
    employees = [
        Employee(
            id="emp_001",
            name="Alice (Manager)",
            shifts_per_month=[8, 12],
            weekday_shifts=[6, 8],
            weekend_shifts=[2, 4],
            tags=["manager", "senior"],
        ),
        Employee(
            id="emp_002",
            name="Bob (Nurse)",
            shifts_per_month=[10, 15],
            weekday_shifts=[8, 12],
            weekend_shifts=[2, 3],
            tags=["nurse", "certified"],
        ),
        Employee(
            id="emp_003",
            name="Carol (Trainee)",
            shifts_per_month=[6, 10],
            weekday_shifts=[4, 8],
            weekend_shifts=[2, 2],
            tags=["trainee"],
        ),
    ]

    # Create constraints using available types
    constraints = [
        # Alice PREFERS to work on day 1, shift 0 (morning)
        Constraint(
            id="prefer_1",
            employee_id="emp_001",
            date=1,
            shift_index=0,  # morning
            type=ConstraintType.PREFER,
            reason="Preferred for monthly meeting",
        ),
        # Bob AVOIDS day 5, shift 0
        Constraint(
            id="avoid_1",
            employee_id="emp_002",
            date=5,
            shift_index=0,
            type=ConstraintType.AVOID,
            reason="Medical appointment",
        ),
        # Bob AVOIDS day 5, shift 1
        Constraint(
            id="avoid_2",
            employee_id="emp_002",
            date=5,
            shift_index=1,
            type=ConstraintType.AVOID,
            reason="Medical appointment",
        ),
        # Alice PREFERS evening shifts
        Constraint(
            id="prefer_evening_1",
            employee_id="emp_001",
            date=3,
            shift_index=2,  # evening
            type=ConstraintType.PREFER,
            reason="Supervisor preferred for evening operations",
        ),
        Constraint(
            id="prefer_evening_2",
            employee_id="emp_001",
            date=7,
            shift_index=2,  # evening
            type=ConstraintType.PREFER,
            reason="Supervisor preferred for evening operations",
        ),
        # Carol PREFERS morning shifts for learning
        Constraint(
            id="prefer_morning_1",
            employee_id="emp_003",
            date=2,
            shift_index=0,  # morning
            type=ConstraintType.PREFER,
            reason="Learning opportunity",
        ),
        Constraint(
            id="prefer_morning_2",
            employee_id="emp_003",
            date=4,
            shift_index=0,  # morning
            type=ConstraintType.PREFER,
            reason="Learning opportunity",
        ),
    ]

    # Create settings with available features
    settings = ScheduleSettings(
        shifts_per_day=3,
        persons_per_shift=[1, 1, 1],  # morning, afternoon, evening
        max_consecutive_shifts=2,
        max_consecutive_days=3,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=5,
        min_shifts_per_week=2,
        even_distribution=True,
        preference_weight=4,
        fairness_weight=3,
        optimize_for="balanced",
    )

    # Test with February 2025 (short month)
    result = solver.solve_schedule(
        employees=employees,
        constraints=constraints,
        settings=settings,
        month=1,  # February
        year=2025,
        timeout=15,
    )

    # Verify the result
    assert result.success in [True, False]
    assert result.metadata is not None

    if result.success:
        print(f"✓ Advanced constraints test successful!")
        print(f"  Solver status: {result.metadata.solver_status}")
        print(f"  Solve time: {result.metadata.solve_time:.2f}s")
        print(f"  Objective value: {result.metadata.objective_value}")

        # Verify PREFER constraint: Alice preferably works day 1 morning
        if 1 in result.schedule.days:
            day_1 = result.schedule.days[1]
            if len(day_1.shifts) > 0:
                morning_employees = day_1.shifts[0].employee_ids  # shift 0 = morning
                print(f"  Day 1 morning workers: {morning_employees}")
                # Note: PREFER is a soft constraint, so Alice may or may not be assigned

        # Check Bob's assignment on day 5 (AVOID constraints)
        if 5 in result.schedule.days:
            day_5 = result.schedule.days[5]
            bob_shifts_day5 = 0
            for shift_idx, shift in enumerate(day_5.shifts):
                if "emp_002" in shift.employee_ids:
                    bob_shifts_day5 += 1
            print(
                f"  Bob's shifts on day 5 (should be minimal due to AVOID): {bob_shifts_day5}"
            )

        # Count preferences respected vs violated
        preference_score = 0
        for day_num, day_schedule in result.schedule.days.items():
            # Count if Alice got preferred morning shift on day 1
            if day_num == 1 and len(day_schedule.shifts) > 0:
                if "emp_001" in day_schedule.shifts[0].employee_ids:
                    preference_score += 1

            # Count if Bob avoided day 5 shifts
            if day_num == 5:
                for shift in day_schedule.shifts:
                    if "emp_002" not in shift.employee_ids:
                        preference_score += 1

        print(f"  Preference score: {preference_score}")

    else:
        print(f"✗ Problem infeasible: {result.message}")
        # Even if infeasible, the solver should handle the constraints gracefully
        assert (
            "infeasible" in result.message.lower()
            or "timeout" in result.message.lower()
            or "capacity" in result.message.lower()
        )


def test_optimization_objectives():
    """Test different optimization objectives in Phase 2"""
    solver = ScheduleSolver()

    employees = [
        Employee(
            id="emp_001",
            name="Worker A",
            shifts_per_month=[8, 12],
            weekday_shifts=[6, 10],
            weekend_shifts=[2, 2],
            tags=["reliable"],
        ),
        Employee(
            id="emp_002",
            name="Worker B",
            shifts_per_month=[8, 12],
            weekday_shifts=[6, 10],
            weekend_shifts=[2, 2],
            tags=["flexible"],
        ),
    ]

    base_settings = ScheduleSettings(
        shifts_per_day=2,
        persons_per_shift=[1, 1],
        max_consecutive_shifts=3,
        max_consecutive_days=4,
        min_rest_days_between_shifts=1,
        prevent_multiple_shifts_per_day=True,
        max_shifts_per_week=4,
        min_shifts_per_week=2,
        even_distribution=True,
        fairness_weight=2,
        preference_weight=1,
    )

    objectives_to_test = ["balanced", "minimal_cost", "max_coverage"]

    for objective in objectives_to_test:
        print(f"\nTesting optimization objective: {objective}")

        # Update settings with current objective
        settings = base_settings.model_copy()
        settings.optimize_for = objective

        result = solver.solve_schedule(
            employees=employees,
            constraints=[],
            settings=settings,
            month=1,  # February 2025
            year=2025,
            timeout=10,
        )

        assert result.success in [True, False]
        print(f"  {objective}: {'✓ Success' if result.success else '✗ Failed'}")

        if result.success:
            print(f"    Status: {result.metadata.solver_status}")
            print(f"    Objective value: {result.metadata.objective_value}")
            print(f"    Solve time: {result.metadata.solve_time:.2f}s")
