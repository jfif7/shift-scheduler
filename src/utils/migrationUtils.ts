import { Schedule, ScheduleSettings, ShiftAssignment } from "@/types/schedule"

// Legacy types for migration
export interface LegacySchedule {
  [date: number]: string[] // employee IDs assigned to each date
}

export interface LegacyScheduleSettings {
  shiftsPerDay: number
  personsPerShift: number // Single number instead of array
  maxConsecutiveShifts: number
  minRestDaysBetweenShifts: number
  weekendCoverageRequired: boolean
  maxShiftsPerWeek: number
  minShiftsPerWeek: number
  evenDistribution: boolean
}

/**
 * Migrate legacy schedule format to new shift-aware format
 */
export const migrateLegacySchedule = (
  legacySchedule: LegacySchedule
): Schedule => {
  const newSchedule: Schedule = {}

  Object.entries(legacySchedule).forEach(([date, employeeIds]) => {
    newSchedule[parseInt(date)] = {
      shifts: [{ employeeIds }], // Single shift with all employees
    }
  })

  return newSchedule
}

/**
 * Migrate legacy settings format to new array-based personsPerShift
 */
export const migrateLegacySettings = (
  legacySettings: LegacyScheduleSettings
): ScheduleSettings => {
  return {
    ...legacySettings,
    personsPerShift: Array(legacySettings.shiftsPerDay).fill(
      legacySettings.personsPerShift
    ),
    shiftLabels: Array.from(
      { length: legacySettings.shiftsPerDay },
      (_, i) => `Shift ${i + 1}`
    ),
  }
}

/**
 * Check if schedule is in legacy format
 */
export const isLegacySchedule = (
  schedule: unknown
): schedule is LegacySchedule => {
  if (!schedule || typeof schedule !== "object") return false

  // Check if any date has the old array format instead of new DaySchedule format
  for (const value of Object.values(schedule)) {
    if (Array.isArray(value)) {
      return true // Legacy format: date -> string[]
    }
    if (value && typeof value === "object" && "shifts" in value) {
      return false // New format: date -> DaySchedule
    }
  }

  return false
}

/**
 * Check if settings are in legacy format
 */
export const isLegacySettings = (
  settings: unknown
): settings is LegacyScheduleSettings => {
  return Boolean(
    settings &&
      typeof settings === "object" &&
      "personsPerShift" in settings &&
      typeof settings.personsPerShift === "number" &&
      !Array.isArray(settings.personsPerShift)
  )
}

/**
 * Convert new schedule format back to legacy for backward compatibility
 * (useful for components that haven't been updated yet)
 */
export const scheduleToLegacyFormat = (schedule: Schedule): LegacySchedule => {
  const legacySchedule: LegacySchedule = {}

  Object.entries(schedule).forEach(([date, daySchedule]) => {
    const allEmployees: string[] = []
    daySchedule.shifts.forEach((shift: ShiftAssignment) => {
      allEmployees.push(...shift.employeeIds)
    })
    legacySchedule[parseInt(date)] = allEmployees
  })

  return legacySchedule
}
