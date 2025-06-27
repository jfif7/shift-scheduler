import { Employee, Constraint, Schedule } from "@/types/schedule"
import { toast } from "sonner"

export const useEmployeeManagement = (
  employees: Employee[],
  setEmployees: (employees: Employee[]) => void,
  constraints: Constraint[],
  setConstraints: (constraints: Constraint[]) => void,
  schedule: Schedule,
  setSchedule: (schedule: Schedule) => void,
  t?: (key: string, params?: Record<string, string | number>) => string
) => {
  const addEmployee = () => {
    const newEmployeeText = t ? t("employees.newEmployee") : "New Employee"

    const nextNumber = employees.length + 1
    const paddedNumber = nextNumber.toString().padStart(3, "0")

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: `${newEmployeeText} ${paddedNumber}`,
      shiftsPerMonth: 8,
      tags: [],
    }

    setEmployees([...employees, newEmployee])
    if (t) {
      toast.success(t("toast.employeeAdded"), {
        description: t("toast.employeeAddedDescription", {
          name: newEmployee.name,
        }),
      })
    } else {
      toast.success("Employee added", {
        description: `${newEmployee.name} has been added to the schedule.`,
      })
    }
  }

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
    setConstraints(
      constraints.filter((constraint) => constraint.employeeId !== id)
    )
    // Remove from schedule
    const newSchedule = { ...schedule }
    Object.keys(newSchedule).forEach((date) => {
      newSchedule[Number.parseInt(date)] = newSchedule[
        Number.parseInt(date)
      ].filter((empId: string) => empId !== id)
    })
    setSchedule(newSchedule)
  }

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    )
    if (t) {
      toast.success(t("toast.employeeUpdated"), {
        description: t("toast.employeeUpdatedDescription"),
      })
    } else {
      toast.success("Employee updated", {
        description: "Employee information has been saved.",
      })
    }
  }

  const toggleEmployeeTag = (employeeId: string, tag: string) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === employeeId) {
          const hasTag = emp.tags.includes(tag)
          return {
            ...emp,
            tags: hasTag
              ? emp.tags.filter((t) => t !== tag)
              : [...emp.tags, tag],
          }
        }
        return emp
      })
    )
  }

  return {
    addEmployee,
    removeEmployee,
    updateEmployee,
    toggleEmployeeTag,
  }
}
