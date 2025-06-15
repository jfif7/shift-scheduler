import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
} from "@/types/schedule"
import { getDaysInMonth, isWeekend } from "./dateUtils"

export const generateSchedule = (
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  selectedMonth: number,
  selectedYear: number
): { schedule: Schedule; success: boolean; message: string } => {
  if (employees.length === 0) {
    return {
      schedule: {},
      success: false,
      message: "Please add employees before generating a schedule.",
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const newSchedule: Schedule = {}

  // Initialize empty schedule
  for (let day = 1; day <= daysInMonth; day++) {
    newSchedule[day] = []
  }

  // Calculate total shifts needed and available
  const totalShiftsNeeded =
    daysInMonth * settings.shiftsPerDay * settings.personsPerShift
  const totalShiftsAvailable = employees.reduce(
    (sum, emp) => sum + emp.shiftsPerMonth,
    0
  )

  if (totalShiftsAvailable < totalShiftsNeeded) {
    return {
      schedule: {},
      success: false,
      message: `Need ${totalShiftsNeeded} total shifts, but only ${totalShiftsAvailable} available.`,
    }
  }

  // Create employee shift tracking
  const employeeShiftsRemaining = employees.reduce((acc, emp) => {
    acc[emp.id] = emp.shiftsPerMonth
    return acc
  }, {} as Record<string, number>)

  // Track consecutive shifts and weekly shifts for each employee
  const consecutiveShifts = employees.reduce((acc, emp) => {
    acc[emp.id] = 0
    return acc
  }, {} as Record<string, number>)

  const weeklyShifts = employees.reduce((acc, emp) => {
    acc[emp.id] = 0
    return acc
  }, {} as Record<string, number>)

  // Generate schedule day by day
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = new Date(selectedYear, selectedMonth - 1, day).getDay()
    const isWeekendDay = isWeekend(day, selectedMonth, selectedYear)

    // Reset weekly counters on Monday (dayOfWeek === 1)
    if (dayOfWeek === 1) {
      Object.keys(weeklyShifts).forEach((empId) => {
        weeklyShifts[empId] = 0
      })
    }

    // For each shift in the day
    for (let shift = 0; shift < settings.shiftsPerDay; shift++) {
      // For each person needed in this shift
      for (let person = 0; person < settings.personsPerShift; person++) {
        const availableEmployees = employees.filter((emp) => {
          // Check if employee has shifts remaining
          if (employeeShiftsRemaining[emp.id] <= 0) return false

          // Check avoid constraints
          const hasAvoidConstraint = constraints.some(
            (constraint) =>
              constraint.employeeId === emp.id &&
              constraint.type === "avoid" &&
              constraint.date === day
          )
          if (hasAvoidConstraint) return false

          // Check consecutive shifts limit
          if (consecutiveShifts[emp.id] >= settings.maxConsecutiveShifts)
            return false

          // Check weekly limits
          if (weeklyShifts[emp.id] >= settings.maxShiftsPerWeek) return false

          // Check if already assigned to this day
          if (newSchedule[day].includes(emp.id)) return false

          // Weekend coverage check
          if (
            isWeekendDay &&
            settings.weekendCoverageRequired &&
            emp.tags.includes("Weekend type")
          ) {
            return true // Prioritize weekend workers
          }

          return true
        })

        if (availableEmployees.length === 0) {
          // If no one is available, try to assign someone anyway (relaxing some constraints)
          const fallbackEmployees = employees.filter(
            (emp) =>
              employeeShiftsRemaining[emp.id] > 0 &&
              !constraints.some(
                (c) =>
                  c.employeeId === emp.id &&
                  c.type === "avoid" &&
                  c.date === day
              ) &&
              !newSchedule[day].includes(emp.id)
          )
          if (fallbackEmployees.length > 0) {
            const selectedEmployee = fallbackEmployees[0]
            newSchedule[day].push(selectedEmployee.id)
            employeeShiftsRemaining[selectedEmployee.id]--
            consecutiveShifts[selectedEmployee.id]++
            weeklyShifts[selectedEmployee.id]++
          }
        } else {
          // Prioritize employees with prefer constraints
          const preferredEmployees = availableEmployees.filter((emp) =>
            constraints.some(
              (c) =>
                c.employeeId === emp.id && c.type === "prefer" && c.date === day
            )
          )

          // For weekend, prioritize weekend workers
          const weekendWorkers = isWeekendDay
            ? availableEmployees.filter((emp) =>
                emp.tags.includes("Weekend type")
              )
            : []

          let candidateEmployees = availableEmployees
          if (preferredEmployees.length > 0) {
            candidateEmployees = preferredEmployees
          } else if (weekendWorkers.length > 0 && isWeekendDay) {
            candidateEmployees = weekendWorkers
          }

          // Select employee with most remaining shifts (to balance workload) if even distribution is enabled
          const selectedEmployee = settings.evenDistribution
            ? candidateEmployees.reduce((prev, current) =>
                employeeShiftsRemaining[current.id] >
                employeeShiftsRemaining[prev.id]
                  ? current
                  : prev
              )
            : candidateEmployees[
                Math.floor(Math.random() * candidateEmployees.length)
              ]

          newSchedule[day].push(selectedEmployee.id)
          employeeShiftsRemaining[selectedEmployee.id]--
          consecutiveShifts[selectedEmployee.id]++
          weeklyShifts[selectedEmployee.id]++
        }
      }
    }

    // Reset consecutive counter for employees not working today
    employees.forEach((emp) => {
      if (!newSchedule[day].includes(emp.id)) {
        consecutiveShifts[emp.id] = 0
      }
    })
  }

  return {
    schedule: newSchedule,
    success: true,
    message: "New schedule has been created based on your constraints.",
  }
}
