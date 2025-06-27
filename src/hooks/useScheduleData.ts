import { useState, useEffect, useCallback } from "react"
import {
  ScheduleData,
  ScheduleSettings,
  ScheduleItem,
  Employee,
  Constraint,
  Schedule,
} from "@/types/schedule"

const DEFAULT_SETTINGS: ScheduleSettings = {
  shiftsPerDay: 1,
  personsPerShift: 1,
  maxConsecutiveShifts: 3,
  minRestDaysBetweenShifts: 0,
  weekendCoverageRequired: true,
  maxShiftsPerWeek: 5,
  minShiftsPerWeek: 1,
  evenDistribution: true,
}

export const useScheduleData = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null)
  const [settings, setSettings] = useState<ScheduleSettings>(DEFAULT_SETTINGS)

  const saveToLocalStorage = useCallback(() => {
    const data: ScheduleData = {
      schedules,
      settings,
    }
    localStorage.setItem("scheduleData", JSON.stringify(data))
  }, [schedules, settings])

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage()
  }, [saveToLocalStorage])

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("scheduleData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setSchedules(
          (data.schedules || []).map((schedule: ScheduleItem) => ({
            ...schedule,
            createdAt: new Date(schedule.createdAt),
          }))
        )
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
    }
  }

  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  const addSchedule = (
    month: number,
    year: number,
    importFromScheduleId?: string
  ): string => {
    // Check for duplicate
    const exists = schedules.some((s) => s.month === month && s.year === year)
    if (exists) {
      throw new Error(`Schedule for ${month}/${year} already exists`)
    }

    // Get employees to import if specified
    let employeesToImport: Employee[] = []
    if (importFromScheduleId) {
      const sourceSchedule = schedules.find(
        (s) => s.id === importFromScheduleId
      )
      if (sourceSchedule && sourceSchedule.employees.length > 0) {
        // Create independent copies of employees with new IDs
        employeesToImport = sourceSchedule.employees.map((employee) => ({
          ...employee,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`, // Generate new unique ID
        }))
      }
    }

    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      month,
      year,
      employees: employeesToImport,
      constraints: [],
      schedule: {},
      createdAt: new Date(),
      isGenerated: false,
    }

    setSchedules((prev) => [...prev, newSchedule])
    setActiveScheduleId(newSchedule.id)
    return newSchedule.id
  }

  const deleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    if (activeScheduleId === scheduleId) {
      setActiveScheduleId(null)
    }
  }

  const updateSchedule = (
    scheduleId: string,
    updates: Partial<ScheduleItem>
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
      )
    )
  }

  const getActiveSchedule = (): ScheduleItem | null => {
    return schedules.find((s) => s.id === activeScheduleId) || null
  }

  // Derived values for active schedule
  const activeSchedule = getActiveSchedule()
  const selectedMonth = activeSchedule?.month || 0
  const selectedYear = activeSchedule?.year || 0
  const employees = activeSchedule?.employees || []
  const constraints = activeSchedule?.constraints || []
  const schedule = activeSchedule?.schedule || {}

  const setEmployees = (employees: Employee[]) => {
    if (activeScheduleId) {
      updateSchedule(activeScheduleId, { employees })
    }
  }

  const setConstraints = (constraints: Constraint[]) => {
    if (activeScheduleId) {
      updateSchedule(activeScheduleId, { constraints })
    }
  }

  const setSchedule = (schedule: Schedule) => {
    if (activeScheduleId) {
      updateSchedule(activeScheduleId, {
        schedule,
        isGenerated: Object.keys(schedule).length > 0,
      })
    }
  }

  return {
    // Schedule history management
    schedules,
    activeScheduleId,
    setActiveScheduleId,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    getActiveSchedule,

    // Active schedule data
    selectedMonth,
    selectedYear,
    employees,
    setEmployees,
    constraints,
    setConstraints,
    schedule,
    setSchedule,

    // Global settings
    settings,
    setSettings,
  }
}
