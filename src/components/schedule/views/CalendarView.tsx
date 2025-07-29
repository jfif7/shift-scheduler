import {
  Employee,
  Schedule,
  Constraint,
  ScheduleSettings,
} from "@/types/schedule"
import { useTranslations } from "next-intl"
import { getDaysInMonth, getFirstDayOfMonth } from "@/utils/dateUtils"
import { CalendarCell } from "../cells/CalendarCell"
import { cn } from "@/lib/utils"

interface CalendarViewProps {
  schedule: Schedule
  employees: Employee[]
  selectedMonth: number
  selectedYear: number
  constraints?: Constraint[]
  selectedEmployee?: string
  settings: ScheduleSettings
  showShiftColors: boolean
  onSetConstraint?: (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number,
    shiftIndex?: number
  ) => void
  onRemoveConstraint?: (
    employeeId: string,
    date: number,
    shiftIndex?: number
  ) => void
  onShiftClick: (day: number, shiftIndex: number) => void
  onDayClick: (day: number) => void
}

export const CalendarView = ({
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  constraints = [],
  selectedEmployee,
  settings,
  showShiftColors,
  onShiftClick,
  onDayClick,
}: CalendarViewProps) => {
  const t = useTranslations()

  const renderScheduleGrid = () => {
    if (!selectedMonth || !selectedYear) return null

    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const cells = []
    const totalCells = firstDay + daysInMonth

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const isLastInRow = (i + 1) % 7 === 0
      const isInLastRow = i >= Math.floor(totalCells / 7) * 7

      const emptyCellClasses = ["p-2 min-h-20 border-gray-400"]
      if (!isLastInRow) emptyCellClasses.push("border-r")
      if (!isInLastRow) emptyCellClasses.push("border-b")

      cells.push(
        <div key={`empty-${i}`} className={cn(emptyCellClasses)}></div>
      )
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedule = schedule[day]

      // Calculate position for border logic
      const cellIndex = firstDay + day - 1
      const isLastInRow = (cellIndex + 1) % 7 === 0
      const isInLastRow = cellIndex >= Math.floor(totalCells / 7) * 7

      cells.push(
        <CalendarCell
          key={day}
          day={day}
          daySchedule={daySchedule}
          employees={employees}
          constraints={constraints}
          selectedEmployee={selectedEmployee}
          settings={settings}
          isLastInRow={isLastInRow}
          isInLastRow={isInLastRow}
          showShiftColors={showShiftColors}
          onShiftClick={onShiftClick}
          onDayClick={onDayClick}
        />
      )
    }

    return cells
  }

  return (
    <div className="border border-gray-400 rounded-lg overflow-hidden">
      <div className="grid grid-cols-7">
        {[
          t("days.0"),
          t("days.1"),
          t("days.2"),
          t("days.3"),
          t("days.4"),
          t("days.5"),
          t("days.6"),
        ].map((day) => (
          <div
            key={day}
            className="p-3 text-center font-medium bg-muted border-r border-b border-gray-400 last:border-r-0"
          >
            {day}
          </div>
        ))}
        {renderScheduleGrid()}
      </div>
    </div>
  )
}
