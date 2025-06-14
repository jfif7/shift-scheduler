import { useState, useEffect, useCallback } from "react"
import {
  ScheduleData,
  ScheduleSettings,
  Employee,
  Constraint,
  Schedule,
} from "@/types/schedule"
import { getCurrentMonthYear } from "@/utils/dateUtils"

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
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [schedule, setSchedule] = useState<Schedule>({})
  const [settings, setSettings] = useState<ScheduleSettings>(DEFAULT_SETTINGS)

  // Initialize with current month/year
  useEffect(() => {
    const { month, year } = getCurrentMonthYear()
    setSelectedMonth(month)
    setSelectedYear(year)
    loadFromLocalStorage()
  }, [])

  const saveToLocalStorage = useCallback(() => {
    const data: ScheduleData = {
      employees,
      constraints,
      schedule,
      selectedMonth,
      selectedYear,
      settings,
    }
    localStorage.setItem("scheduleData", JSON.stringify(data))
  }, [employees, constraints, schedule, selectedMonth, selectedYear, settings])

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage()
  }, [saveToLocalStorage])

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("scheduleData")
    if (saved) {
      try {
        const data = JSON.parse(saved) as ScheduleData
        setEmployees(
          (data.employees || []).map((emp: Employee) => ({
            ...emp,
            tags: emp.tags || [],
          }))
        )
        setConstraints(data.constraints || [])
        setSchedule(data.schedule || {})
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        if (data.selectedMonth) setSelectedMonth(data.selectedMonth)
        if (data.selectedYear) setSelectedYear(data.selectedYear)
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
    }
  }

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    employees,
    setEmployees,
    constraints,
    setConstraints,
    schedule,
    setSchedule,
    settings,
    setSettings,
    saveToLocalStorage,
    loadFromLocalStorage,
  }
}
