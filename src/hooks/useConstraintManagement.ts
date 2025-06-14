import { Constraint } from "@/types/schedule"

export const useConstraintManagement = (
  constraints: Constraint[],
  setConstraints: (constraints: Constraint[]) => void
) => {
  const getConstraintsForEmployee = (employeeId: string) => {
    return constraints.filter(
      (constraint) => constraint.employeeId === employeeId
    )
  }

  const getConstraintForDate = (employeeId: string, date: number) => {
    return constraints.find(
      (constraint) =>
        constraint.employeeId === employeeId && constraint.date === date
    )
  }

  const removeConstraint = (employeeId: string, date: number) => {
    setConstraints(
      constraints.filter(
        (constraint) =>
          !(constraint.employeeId === employeeId && constraint.date === date)
      )
    )
  }

  const setConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number
  ) => {
    // First remove any existing constraint for this employee and date
    const updatedConstraints = constraints.filter(
      (constraint) =>
        !(constraint.employeeId === employeeId && constraint.date === date)
    )

    // Then add the new constraint
    const newConstraint: Constraint = {
      id: Date.now().toString(),
      employeeId,
      type,
      date,
    }

    setConstraints([...updatedConstraints, newConstraint])
  }

  return {
    getConstraintsForEmployee,
    getConstraintForDate,
    removeConstraint,
    setConstraint,
  }
}
