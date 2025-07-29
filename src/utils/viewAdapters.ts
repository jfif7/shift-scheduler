import { Employee, Schedule, ScheduleSettings } from "@/types/schedule"
import { getDaysInMonth } from "@/utils/dateUtils"

export interface SpreadsheetData {
  employees: Employee[]
  dateColumns: DateColumn[]
  cells: SpreadsheetCell[][]
}

export interface DateColumn {
  date: number
  dayOfWeek: string
  isWeekend: boolean
}

export interface SpreadsheetCell {
  employeeId: string
  date: number
  shifts: string[] // Shift labels for this employee/date
  shiftIndices: number[] // Shift indices for proper color mapping
  isEmpty: boolean
  hasConstraints?: boolean
}

export const adaptScheduleForSpreadsheet = (
  schedule: Schedule,
  employees: Employee[],
  selectedMonth: number,
  selectedYear: number,
  settings: ScheduleSettings
): SpreadsheetData => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)

  // Create date columns
  const dateColumns: DateColumn[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day)
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" })
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    dateColumns.push({
      date: day,
      dayOfWeek,
      isWeekend,
    })
  }

  // Create cells matrix
  const cells: SpreadsheetCell[][] = []

  employees.forEach((employee) => {
    const employeeRow: SpreadsheetCell[] = []

    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedule = schedule[day]
      const shifts: string[] = []
      const shiftIndices: number[] = []

      if (daySchedule?.shifts) {
        daySchedule.shifts.forEach((shift, shiftIndex) => {
          if (shift.employeeIds.includes(employee.id)) {
            const shiftLabel =
              settings.shiftLabels?.[shiftIndex] || `Shift ${shiftIndex + 1}`
            shifts.push(shiftLabel)
            shiftIndices.push(shiftIndex)
          }
        })
      }

      employeeRow.push({
        employeeId: employee.id,
        date: day,
        shifts,
        shiftIndices,
        isEmpty: shifts.length === 0,
      })
    }

    cells.push(employeeRow)
  })

  return {
    employees,
    dateColumns,
    cells,
  }
}
