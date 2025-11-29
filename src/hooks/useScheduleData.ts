import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  ScheduleData,
  ScheduleSettings,
  ScheduleItem,
  Employee,
  Constraint,
  Schedule,
} from "@/types/schedule"
import { useAuth } from "@/contexts/AuthContext"
import {
  loadUserSchedules,
  saveSchedule as saveToFirestore,
  deleteSchedule as deleteFromFirestore,
  subscribeToUserSchedules,
  loadUserSettings,
  saveUserSettings,
} from "@/services/firestoreAPI"

const DEFAULT_SETTINGS: ScheduleSettings = {
  shiftsPerDay: 1,
  personsPerShift: [1],
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
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null)
  const [settings, setSettings] = useState<ScheduleSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState<boolean>(false)

  const loadFromFirestore = useCallback(async () => {
    if (!user) return

    try {
      const firestoreSchedules = await loadUserSchedules(user.uid)
      setSchedules(firestoreSchedules)

      const userSettings = await loadUserSettings(user.uid)
      if (userSettings?.scheduleSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...userSettings.scheduleSettings })
      }
    } catch (error) {
      console.error("Error loading from Firestore:", error)
    }
  }, [user])

  const loadFromLocalStorage = useCallback(() => {
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
  }, [])

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await loadFromFirestore()
      } else {
        loadFromLocalStorage()
      }
      setLoaded(true)
    }

    loadData()
  }, [user, loadFromFirestore, loadFromLocalStorage])

  useEffect(() => {
    if (!user || !loaded) return

    const unsubscribe = subscribeToUserSchedules(
      user.uid,
      (firestoreSchedules) => {
        setSchedules(firestoreSchedules)
      }
    )

    return () => unsubscribe()
  }, [user, loaded])

  useEffect(() => {
    if (loaded === false || user) return

    const data: ScheduleData = {
      schedules,
      settings,
    }
    localStorage.setItem("scheduleData", JSON.stringify(data))
  }, [schedules, settings, loaded, user])

  useEffect(() => {
    if (!user || !loaded) return

    const saveSettings = async () => {
      try {
        await saveUserSettings(user.uid, {
          locale: "zh-TW",
          preferences: {},
          scheduleSettings: settings,
        })
      } catch (error) {
        console.error("Error saving settings to Firestore:", error)
      }
    }

    saveSettings()
  }, [settings, user, loaded])

  const addSchedule = async (
    month: number,
    year: number,
    name: string,
    importFromScheduleId?: string
  ): Promise<string> => {
    let employeesToImport: Employee[] = []
    if (importFromScheduleId) {
      const sourceSchedule = schedules.find(
        (s) => s.id === importFromScheduleId
      )
      if (sourceSchedule && sourceSchedule.employees.length > 0) {
        employeesToImport = sourceSchedule.employees.map((employee) => ({
          ...employee,
          id: uuidv4(),
        }))
      }
    }

    const newSchedule: ScheduleItem = {
      id: user ? "new" : uuidv4(),
      name,
      month,
      year,
      employees: employeesToImport,
      constraints: [],
      schedule: {},
      createdAt: new Date(),
      isGenerated: false,
    }

    if (user) {
      const firestoreId = await saveToFirestore(user.uid, newSchedule)
      setActiveScheduleId(firestoreId)
      return firestoreId
    } else {
      setSchedules((prev) => [...prev, newSchedule])
      setActiveScheduleId(newSchedule.id)
      return newSchedule.id
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (user) {
      await deleteFromFirestore(scheduleId)
    } else {
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
    }

    if (activeScheduleId === scheduleId) {
      setActiveScheduleId(null)
    }
  }

  const addPredefinedSchedule = (newSchedule: ScheduleItem): string => {
    if (schedules.find((schedule) => schedule.id === newSchedule.id)) {
      newSchedule.id = uuidv4()
    }
    setSchedules((prev) => [...prev, newSchedule])
    setActiveScheduleId(newSchedule.id)
    return newSchedule.id
  }

  const updateSchedule = async (
    scheduleId: string,
    updates: Partial<ScheduleItem>
  ) => {
    if (user) {
      const scheduleToUpdate = schedules.find((s) => s.id === scheduleId)
      if (scheduleToUpdate) {
        const updatedSchedule = { ...scheduleToUpdate, ...updates }
        await saveToFirestore(user.uid, updatedSchedule)
      }
    } else {
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
        )
      )
    }
  }

  const getActiveSchedule = (): ScheduleItem | null => {
    return schedules.find((s) => s.id === activeScheduleId) || null
  }

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
    schedules,
    activeScheduleId,
    setActiveScheduleId,
    addSchedule,
    addPredefinedSchedule,
    deleteSchedule,
    updateSchedule,
    getActiveSchedule,

    selectedMonth,
    selectedYear,
    employees,
    setEmployees,
    constraints,
    setConstraints,
    schedule,
    setSchedule,

    settings,
    setSettings,
  }
}
