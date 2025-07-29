from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum


class ConstraintType(str, Enum):
    AVOID = "avoid"
    PREFER = "prefer"


class Employee(BaseModel):
    id: str
    name: str
    shifts_per_month: List[int] = Field(
        ..., min_length=2, max_length=2, description="[min, max] shifts per month"
    )
    weekday_shifts: List[int] = Field(
        ..., min_length=2, max_length=2, description="[min, max] weekday shifts"
    )
    weekend_shifts: List[int] = Field(
        ..., min_length=2, max_length=2, description="[min, max] weekend shifts"
    )
    tags: List[str] = Field(default_factory=list)


class Constraint(BaseModel):
    id: str
    employee_id: str
    type: ConstraintType
    date: int = Field(..., ge=1, le=31, description="Day of the month")
    shift_index: int = Field(..., ge=0, description="0-based shift index")
    required_skill: Optional[str] = Field(
        default=None, description="Required skill/tag for skill_required constraints"
    )
    reason: Optional[str] = Field(
        default=None, description="Human-readable reason for the constraint"
    )


class ScheduleSettings(BaseModel):
    shifts_per_day: int = Field(..., ge=1, le=5, description="Number of shifts per day")
    persons_per_shift: List[int] = Field(
        ..., min_length=1, description="Number of persons required for each shift"
    )
    max_consecutive_shifts: int = Field(
        default=3, ge=1, description="Maximum consecutive shifts"
    )
    max_consecutive_days: int = Field(
        default=6, ge=1, description="Maximum consecutive working days"
    )
    min_rest_days_between_shifts: int = Field(
        default=0, ge=0, description="Minimum rest days between shifts"
    )
    prevent_multiple_shifts_per_day: bool = Field(
        default=True, description="Prevent multiple shifts per day for same employee"
    )
    max_shifts_per_week: int = Field(
        default=7, ge=1, description="Maximum shifts per week"
    )
    min_shifts_per_week: int = Field(
        default=0, ge=0, description="Minimum shifts per week"
    )
    even_distribution: bool = Field(
        default=True, description="Try to balance weekend shifts fairly"
    )
    fairness_weight: float = Field(
        default=1.0, ge=0.0, description="Weight for fairness in objective"
    )
    preference_weight: float = Field(
        default=1.0,
        ge=0.0,
        description="Weight for preference constraints in objective",
    )
    optimize_for: str = Field(
        default="balanced",
        description="Optimization goal: 'balanced', 'minimal_cost', 'max_coverage'",
    )


class GenerateScheduleRequest(BaseModel):
    employees: List[Employee]
    constraints: List[Constraint] = Field(default_factory=list)
    settings: ScheduleSettings
    selected_month: int = Field(..., ge=0, le=11, description="Month (0-11)")
    selected_year: int = Field(..., ge=2020, le=2050, description="Year")
    timeout: int = Field(default=30, ge=5, le=300, description="Timeout in seconds")


class ShiftAssignment(BaseModel):
    employee_ids: List[str]


class DaySchedule(BaseModel):
    shifts: List[ShiftAssignment]


class Schedule(BaseModel):
    days: Dict[int, DaySchedule] = Field(
        default_factory=dict, description="Day number to schedule mapping"
    )


class SolverMetadata(BaseModel):
    solver_status: str
    solve_time: float
    objective_value: int
    constraints_satisfied: bool
    algorithm: str = "cp-sat"


class GenerateScheduleResponse(BaseModel):
    success: bool
    schedule: Schedule
    metadata: SolverMetadata
    message: str


class HealthResponse(BaseModel):
    status: str = "healthy"
    timestamp: str
    version: str = "1.0.0"


class SolverStatusResponse(BaseModel):
    available: bool = True
    current_load: int = 0
    max_concurrent: int = 10
    solver_version: str
