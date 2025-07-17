import { Constraint, ShiftConstraint } from "@/types/schedule"
import { v4 as uuidv4 } from "uuid"

export const useConstraintManagement = (
  constraints: Constraint[],
  setConstraints: (constraints: Constraint[]) => void
) => {
  const getConstraintsForEmployee = (employeeId: string) => {
    return constraints.filter(
      (constraint) => constraint.employeeId === employeeId
    )
  }

  const getShiftConstraint = (
    employeeId: string,
    date: number,
    shiftIndex: number
  ) => {
    return constraints.find(
      (constraint) =>
        constraint.employeeId === employeeId &&
        constraint.date === date &&
        constraint.shiftIndex === shiftIndex
    ) as ShiftConstraint | undefined
  }

  const removeConstraint = (
    employeeId: string,
    date: number,
    shiftIndex?: number
  ) => {
    setConstraints(
      constraints.filter((constraint) => {
        if (constraint.employeeId !== employeeId || constraint.date !== date) {
          return true // Keep constraints for different employee/date
        }

        if (shiftIndex !== undefined) {
          // Remove specific shift constraint
          return constraint.shiftIndex !== shiftIndex
        } else {
          // Remove all constraints for this employee and date (all shifts)
          return false
        }
      })
    )
  }

  const setShiftConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number,
    shiftIndex: number
  ) => {
    // First remove any existing shift constraint for this employee, date, and shift
    const updatedConstraints = constraints.filter(
      (constraint) =>
        !(
          constraint.employeeId === employeeId &&
          constraint.date === date &&
          constraint.shiftIndex === shiftIndex
        )
    )

    // Then add the new shift constraint
    const newConstraint: ShiftConstraint = {
      id: uuidv4(),
      employeeId,
      type,
      date,
      shiftIndex,
    }

    setConstraints([...updatedConstraints, newConstraint])
  }

  const setAllShiftsConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number,
    shiftsPerDay: number
  ) => {
    // Remove all existing constraints for this employee and date
    const updatedConstraints = constraints.filter(
      (constraint) =>
        !(constraint.employeeId === employeeId && constraint.date === date)
    )

    // Add constraints for all shifts
    const newConstraints = Array.from({ length: shiftsPerDay }, (_, i) => ({
      id: uuidv4(),
      employeeId,
      type,
      date,
      shiftIndex: i,
    }))

    setConstraints([...updatedConstraints, ...newConstraints])
  }

  return {
    getConstraintsForEmployee,
    getShiftConstraint,
    removeConstraint,
    setShiftConstraint,
    setAllShiftsConstraint,
  }
}
