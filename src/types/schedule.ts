export interface Employee {
  id: string
  name: string
  shiftsPerMonth: number
  tags: string[]
}

export interface Constraint {
  id: string
  employeeId: string
  type: "avoid" | "prefer"
  date: number
}

export interface Schedule {
  [date: number]: string[] // employee IDs assigned to each date
}

// Optimized internal schedule representation for simulated annealing
// Single array where each element is an employee index
// Can be longer than needed - only the first daysInMonth * shiftsPerDay * personsPerShift slots are used
// when converting back to Schedule. The extra slots allow for easier permutation-based neighbor generation.
export type OptimizedSchedule = number[]

export interface ScheduleSettings {
  shiftsPerDay: number
  personsPerShift: number
  maxConsecutiveShifts: number
  minRestDaysBetweenShifts: number
  weekendCoverageRequired: boolean
  maxShiftsPerWeek: number
  minShiftsPerWeek: number
  evenDistribution: boolean
}

export interface ScheduleItem {
  id: string
  month: number // 0-11
  year: number // 2025
  employees: Employee[]
  constraints: Constraint[]
  schedule: Schedule
  createdAt: Date
  isGenerated: boolean
}

export interface ScheduleData {
  schedules: ScheduleItem[]
  settings: ScheduleSettings
}
