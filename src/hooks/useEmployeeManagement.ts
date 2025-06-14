import { Employee, Constraint, Schedule } from "@/types/schedule"
import { useToast } from "@/hooks/use-toast"

export const useEmployeeManagement = (
  employees: Employee[],
  setEmployees: (employees: Employee[]) => void,
  constraints: Constraint[],
  setConstraints: (constraints: Constraint[]) => void,
  schedule: Schedule,
  setSchedule: (schedule: Schedule) => void
) => {
  const { toast } = useToast()

  const addEmployee = () => {
    const existingNumbers = employees
      .filter((emp) => emp.name.startsWith("New Employee "))
      .map((emp) => {
        const match = emp.name.match(/New Employee (\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      })

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    const paddedNumber = nextNumber.toString().padStart(3, "0")

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: `New Employee ${paddedNumber}`,
      shiftsPerMonth: 8,
      tags: [],
    }

    setEmployees([...employees, newEmployee])
    toast({
      title: "Employee added",
      description: `${newEmployee.name} has been added to the schedule.`,
    })
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
    toast({
      title: "Employee updated",
      description: "Employee information has been saved.",
    })
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
