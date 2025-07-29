import { Employee, Schedule, ScheduleSettings } from "@/types/schedule"
import { useTranslations } from "next-intl"
import {
  adaptScheduleForSpreadsheet,
  SpreadsheetData,
} from "@/utils/viewAdapters"
import { cn } from "@/lib/utils"

interface SpreadsheetViewProps {
  schedule: Schedule
  employees: Employee[]
  selectedMonth: number
  selectedYear: number
  settings: ScheduleSettings
  showShiftColors: boolean
}

interface SpreadsheetCellProps {
  shifts: string[]
  shiftIndices: number[]
  isEmpty: boolean
  showShiftColors: boolean
  isWeekend: boolean
}

const SpreadsheetCell = ({
  shifts,
  shiftIndices,
  isEmpty,
  showShiftColors,
  isWeekend,
}: SpreadsheetCellProps) => {
  if (isEmpty) {
    return (
      <div
        className={cn(
          "min-h-12 border-r border-b border-gray-300 flex items-center justify-center text-xs text-muted-foreground",
          isWeekend && "bg-gray-50"
        )}
      >
        —
      </div>
    )
  }

  return (
    <div
      className={cn(
        "min-h-12 border-r border-b border-gray-300 text-xs flex flex-col",
        isWeekend && !showShiftColors && "bg-gray-50"
      )}
    >
      {shifts.map((shift, index) => (
        <div
          key={`${shift}-${index}`}
          className={cn(
            "flex-1 flex items-center justify-center px-1 py-1 text-center font-medium",
            showShiftColors && `shift-${shiftIndices[index]}`,
            !showShiftColors && isWeekend && "bg-gray-100 text-gray-800",
            !showShiftColors && !isWeekend && "bg-gray-200 text-gray-800"
          )}
          style={{ minHeight: `${48 / shifts.length}px` }}
        >
          <span className="text-xs leading-tight">{shift}</span>
        </div>
      ))}
    </div>
  )
}

export const SpreadsheetView = ({
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  settings,
  showShiftColors,
}: SpreadsheetViewProps) => {
  const t = useTranslations()

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("employees.noEmployeesMessage")}
      </div>
    )
  }

  const spreadsheetData: SpreadsheetData = adaptScheduleForSpreadsheet(
    schedule,
    employees,
    selectedMonth,
    selectedYear,
    settings
  )

  return (
    <div className="border border-gray-400 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header Row */}
          <div
            className="grid gap-0"
            style={{
              gridTemplateColumns: `120px repeat(${spreadsheetData.dateColumns.length}, 60px)`,
            }}
          >
            {/* Employee Header */}
            <div className="p-3 font-medium bg-muted border-r border-b border-gray-400 sticky left-0 z-10">
              {t("employees.title")}
            </div>

            {/* Date Headers */}
            {spreadsheetData.dateColumns.map((dateCol) => (
              <div
                key={dateCol.date}
                className={cn(
                  "p-3 text-center font-medium bg-muted border-r border-b border-gray-400 last:border-r-0",
                  dateCol.isWeekend && "bg-gray-200"
                )}
              >
                <div className="text-sm font-bold">{dateCol.date}</div>
                <div className="text-xs text-muted-foreground">
                  {dateCol.dayOfWeek}
                </div>
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {spreadsheetData.cells.map((employeeRow, employeeIndex) => (
            <div
              key={spreadsheetData.employees[employeeIndex].id}
              className="grid gap-0"
              style={{
                gridTemplateColumns: `120px repeat(${spreadsheetData.dateColumns.length}, 60px)`,
              }}
            >
              {/* Employee Name */}
              <div className="p-3 font-medium border-r border-b border-gray-300 sticky left-0 z-10 bg-white">
                <div
                  className="truncate"
                  title={spreadsheetData.employees[employeeIndex].name}
                >
                  {spreadsheetData.employees[employeeIndex].name}
                </div>
              </div>

              {/* Schedule Cells */}
              {employeeRow.map((cell, cellIndex) => (
                <SpreadsheetCell
                  key={`${cell.employeeId}-${cell.date}`}
                  shifts={cell.shifts}
                  shiftIndices={cell.shiftIndices}
                  isEmpty={cell.isEmpty}
                  showShiftColors={showShiftColors}
                  isWeekend={spreadsheetData.dateColumns[cellIndex].isWeekend}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
