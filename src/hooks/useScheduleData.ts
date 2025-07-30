import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
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
  personsPerShift: [1], // Array format for compatibility
  maxConsecutiveShifts: 3,
  maxConsecutiveDays: 6,
  minRestDaysBetweenShifts: 0,
  preventMultipleShiftsPerDay: true,
  maxShiftsPerWeek: 7,
  minShiftsPerWeek: 0,
  evenDistribution: true,
  shiftLabels: ["Shift 1"],
  preferredAlgorithm: "auto",
}

export const useScheduleData = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null)
  const [settings, setSettings] = useState<ScheduleSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState<boolean>(false)

  useEffect(() => {
    loadFromLocalStorage()
    setLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (loaded === false) return
    const data: ScheduleData = {
      schedules,
      settings,
    }
    localStorage.setItem("scheduleData", JSON.stringify(data))
  }, [schedules, settings, loaded])

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("scheduleData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setSchedules(
          (data.schedules || []).map((schedule: ScheduleItem) => ({
            ...schedule,
            name:
              schedule.name ||
              `Schedule ${schedule.year}/${schedule.month + 1}`,
            createdAt: new Date(schedule.createdAt),
          }))
        )
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
    }
  }

  const addSchedule = (
    month: number,
    year: number,
    name: string,
    importFromScheduleId?: string
  ): string => {
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
          id: uuidv4(),
        }))
      }
    }

    const newSchedule: ScheduleItem = {
      id: uuidv4(),
      name,
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
