export interface Employee {
  id: string
  name: string
  shiftsPerMonth: [number, number] // [min, max]
  weekdayShifts: [number, number] // [min, max]
  weekendShifts: [number, number] // [min, max]
  tags: string[]
}

export interface ShiftConstraint {
  id: string
  employeeId: string
  type: "avoid" | "prefer"
  date: number
  shiftIndex: number // 0-based: 0=first shift, 1=second shift, etc.
}

export type Constraint = ShiftConstraint

export interface ShiftAssignment {
  employeeIds: string[]
}

export interface DaySchedule {
  shifts: ShiftAssignment[] // Array indexed by shift (0, 1, 2...)
}

export interface Schedule {
  [date: number]: DaySchedule
}

// Optimized internal schedule representation for simulated annealing
// Single array where each element is an employee index
// Can be longer than needed - only the first daysInMonth * shiftsPerDay * personsPerShift slots are used
// when converting back to Schedule. The extra slots allow for easier permutation-based neighbor generation.
export type OptimizedSchedule = number[]

export interface ScheduleSettings {
  shiftsPerDay: number
  personsPerShift: number[] // Array to support different staffing per shift
  maxConsecutiveShifts: number
  minRestDaysBetweenShifts: number
  weekendCoverageRequired: boolean
  maxShiftsPerWeek: number
  minShiftsPerWeek: number
  evenDistribution: boolean
  shiftLabels?: string[] // Optional shift naming/labeling
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

// Helper function for calculating slot positions with variable personsPerShift
export const getShiftSlotRange = (
  day: number,
  shiftIndex: number,
  settings: ScheduleSettings
) => {
  const totalPersonsPerDay = settings.personsPerShift.reduce(
    (sum, persons) => sum + persons,
    0
  )
  const dayStartSlot = (day - 1) * totalPersonsPerDay
  let shiftStartSlot = dayStartSlot

  for (let i = 0; i < shiftIndex; i++) {
    shiftStartSlot += settings.personsPerShift[i]
  }

  return {
    start: shiftStartSlot,
    end: shiftStartSlot + settings.personsPerShift[shiftIndex],
  }
}

// Helper function to calculate total slots needed
export const getTotalSlotsNeeded = (
  daysInMonth: number,
  settings: ScheduleSettings
): number => {
  const totalPersonsPerDay = settings.personsPerShift.reduce(
    (sum, persons) => sum + persons,
    0
  )
  return daysInMonth * totalPersonsPerDay
}
