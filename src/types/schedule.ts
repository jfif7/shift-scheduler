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

export interface ScheduleData {
  employees: Employee[]
  constraints: Constraint[]
  schedule: Schedule
  selectedMonth: string
  selectedYear: string
  settings: ScheduleSettings
}
