import { Constraint } from "@/types/schedule"

export const useConstraintManagement = (
  constraints: Constraint[],
  setConstraints: (constraints: Constraint[]) => void
) => {
  const addConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number
  ) => {
    const newConstraint: Constraint = {
      id: Date.now().toString(),
      employeeId,
      type,
      date,
    }
    setConstraints([...constraints, newConstraint])
  }

  const removeConstraint = (id: string) => {
    setConstraints(constraints.filter((constraint) => constraint.id !== id))
  }

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

  return {
    addConstraint,
    removeConstraint,
    getConstraintsForEmployee,
    getConstraintForDate,
  }
}
