import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Employee, Schedule, Constraint } from "@/types/schedule"
import { FileSpreadsheet, FileImage, ChevronDown } from "lucide-react"
import { exportScheduleAsCSV, exportScheduleAsImage } from "@/utils/exportUtils"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
} from "@/utils/dateUtils"

interface ScheduleViewProps {
  schedule: Schedule
  employees: Employee[]
  selectedMonth: number
  selectedYear: number
  hasActiveSchedule: boolean
  constraints?: Constraint[]
  selectedEmployee?: string
  onSetConstraint?: (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number
  ) => void
  onRemoveConstraint?: (employeeId: string, date: number) => void
  onGenerateSchedule?: () => void
  isGenerating?: boolean
}

export const ScheduleView = ({
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  hasActiveSchedule,
  constraints = [],
  selectedEmployee,
  onSetConstraint,
  onRemoveConstraint,
  onGenerateSchedule,
  isGenerating = false,
}: ScheduleViewProps) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const t = useTranslations()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleExportCSV = () => {
    if (Object.keys(schedule).length === 0) {
      toast.error(t("toast.noSchedule"), {
        description: t("toast.pleaseGenerateFirst"),
      })
      return
    }

    try {
      exportScheduleAsCSV(schedule, employees, selectedMonth, selectedYear, t)
      toast.success(t("toast.csvExported"), {
        description: t("toast.csvExportedDescription"),
      })
    } catch {
      toast.error(t("toast.exportFailed"), {
        description: t("toast.csvExportFailedDescription"),
      })
    }
    setShowExportDropdown(false)
  }

  const handleExportImage = () => {
    if (Object.keys(schedule).length === 0) {
      toast.error(t("toast.noSchedule"), {
        description: t("toast.pleaseGenerateFirst"),
      })
      return
    }

    try {
      exportScheduleAsImage(schedule, employees, selectedMonth, selectedYear, t)
      toast.success(t("toast.imageExported"), {
        description: t("toast.imageExportedDescription"),
      })
    } catch {
      toast.error(t("toast.exportFailed"), {
        description: t("toast.imageExportFailedDescription"),
      })
    }
    setShowExportDropdown(false)
  }
  const handleDayClick = (day: number) => {
    if (!selectedEmployee || !onSetConstraint || !onRemoveConstraint) return

    // Find existing constraint for this employee and day
    const existingConstraint = constraints.find(
      (c) => c.employeeId === selectedEmployee && c.date === day
    )

    // 3-state cycle: normal → prefer → avoid → normal
    if (!existingConstraint) {
      // Currently normal → change to prefer
      onSetConstraint(selectedEmployee, "prefer", day)
    } else if (existingConstraint.type === "prefer") {
      // Currently prefer → change to avoid
      onSetConstraint(selectedEmployee, "avoid", day)
    } else if (existingConstraint.type === "avoid") {
      // Currently avoid → change to normal (remove constraint)
      onRemoveConstraint(selectedEmployee, day)
    }
  }

  const renderScheduleGrid = () => {
    if (!selectedMonth || !selectedYear) return null

    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const cells = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const isLastInRow = (i + 1) % 7 === 0
      const totalCells = firstDay + daysInMonth
      const isInLastRow = i >= Math.floor(totalCells / 7) * 7

      let emptyCellClass = "p-2 min-h-20 border-gray-200 "
      if (!isLastInRow) emptyCellClass += "border-r "
      if (!isInLastRow) emptyCellClass += "border-b "

      cells.push(<div key={`empty-${i}`} className={emptyCellClass}></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const assignedEmployees = schedule[day] || []

      // Find existing constraint for selected employee and day
      const existingConstraint = selectedEmployee
        ? constraints.find(
            (c) => c.employeeId === selectedEmployee && c.date === day
          )
        : null

      // Check if selected employee is scheduled on this day
      const isSelectedEmployeeScheduled =
        selectedEmployee && assignedEmployees.includes(selectedEmployee)

      // Calculate position for border logic
      const totalCells = firstDay + daysInMonth
      const cellIndex = firstDay + day - 1
      const isLastInRow = (cellIndex + 1) % 7 === 0
      const isInLastRow = cellIndex >= Math.floor(totalCells / 7) * 7

      let cellClass = "p-2 min-h-20 border-gray-200 "

      // Add borders except for last column and last row
      if (!isLastInRow) cellClass += "border-r "
      if (!isInLastRow) cellClass += "border-b "

      // Apply constraint styling if selectedEmployee is set
      if (selectedEmployee) {
        cellClass += "cursor-pointer transition-colors "

        // If selected employee is scheduled, add special highlighting
        if (isSelectedEmployeeScheduled) {
          if (existingConstraint?.type === "prefer") {
            cellClass +=
              "bg-green-200 hover:bg-green-300 ring-2 ring-green-400 ring-inset"
          } else if (existingConstraint?.type === "avoid") {
            cellClass +=
              "bg-red-200 hover:bg-red-300 ring-2 ring-red-400 ring-inset"
          } else {
            cellClass +=
              "bg-blue-100 hover:bg-blue-200 ring-2 ring-blue-400 ring-inset"
          }
        } else {
          // Normal constraint styling when employee is not scheduled
          if (existingConstraint?.type === "prefer") {
            cellClass += "bg-green-100 hover:bg-green-200"
          } else if (existingConstraint?.type === "avoid") {
            cellClass += "bg-red-100 hover:bg-red-200"
          } else {
            cellClass += "hover:bg-blue-50"
          }
        }
      }

      cells.push(
        <div
          key={day}
          className={cellClass}
          onClick={() => selectedEmployee && handleDayClick(day)}
        >
          <div className="text-sm font-medium">{day}</div>
          {assignedEmployees.map((empId) => {
            const employee = employees.find((emp) => emp.id === empId)
            const isCurrentSelectedEmployee = selectedEmployee === empId
            return (
              <div
                key={`${empId}-${day}`}
                className={`text-xs truncate ${
                  isCurrentSelectedEmployee
                    ? "text-blue-800 font-semibold bg-blue-50 rounded border border-blue-200"
                    : "text-blue-600"
                }`}
                title={employee?.name}
              >
                {employee?.name}
              </div>
            )
          })}
        </div>
      )
    }

    return cells
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!hasActiveSchedule && t("schedule.title")}
            {hasActiveSchedule &&
              t("schedule.monthSchedule", {
                month: getMonthName(selectedMonth, t),
                year: selectedYear,
              })}
            {selectedEmployee && (
              <p className="text-sm text-muted-foreground">
                {t("schedule.settingPreferencesFor")}{" "}
                <strong>
                  {employees.find((emp) => emp.id === selectedEmployee)?.name}
                </strong>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {onGenerateSchedule && (
              <Button
                onClick={onGenerateSchedule}
                disabled={employees.length === 0 || isGenerating}
                size="sm"
              >
                {isGenerating
                  ? t("schedule.generating")
                  : t("schedule.generateButton")}
              </Button>
            )}
            {Object.keys(schedule).length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="flex items-center gap-2"
                >
                  {t("schedule.export")}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showExportDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={handleExportCSV}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      {t("schedule.exportCSV")}
                    </button>
                    <button
                      onClick={handleExportImage}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileImage className="w-4 h-4" />
                      {t("schedule.exportImage")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasActiveSchedule && (
          <p className="text-muted-foreground">
            {t("schedule.noActiveSchedule")}
          </p>
        )}

        {hasActiveSchedule && (
          <div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                    className="p-3 text-center font-medium bg-muted border-r border-b border-gray-200 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
                {renderScheduleGrid()}
              </div>
            </div>

            {selectedEmployee && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  {t("schedule.clickToSetPreferences")}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>{t("schedule.preferredDays")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>{t("schedule.avoidDays")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>{t("schedule.normalDays")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
