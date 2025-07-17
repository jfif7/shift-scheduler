import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Employee,
  Schedule,
  Constraint,
  ScheduleSettings,
} from "@/types/schedule"
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
  settings: ScheduleSettings
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
  settings,
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
      exportScheduleAsCSV(
        schedule,
        employees,
        selectedMonth,
        selectedYear,
        t,
        settings
      )
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
      exportScheduleAsImage(
        schedule,
        employees,
        selectedMonth,
        selectedYear,
        t,
        settings
      )
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

  const handleShiftClick = (day: number, shiftIndex: number) => {
    if (!selectedEmployee || !onSetConstraint || !onRemoveConstraint) return

    // Find existing constraint for this employee, day, and shift
    const existingConstraint = constraints.find(
      (c) =>
        c.employeeId === selectedEmployee &&
        c.date === day &&
        ("shiftIndex" in c ? c.shiftIndex === shiftIndex : false)
    )

    // 3-state cycle: normal → prefer → avoid → normal
    if (!existingConstraint) {
      // Currently normal → change to prefer
      onSetConstraint(selectedEmployee, "prefer", day, shiftIndex)
    } else if (existingConstraint.type === "prefer") {
      // Currently prefer → change to avoid
      onSetConstraint(selectedEmployee, "avoid", day, shiftIndex)
    } else if (existingConstraint.type === "avoid") {
      // Currently avoid → change to normal (remove constraint)
      onRemoveConstraint(selectedEmployee, day, shiftIndex)
    }
  }

  const handleDayClick = (day: number) => {
    if (!selectedEmployee || !onSetConstraint || !onRemoveConstraint) return

    // Check if there are any existing shift-level constraints for this day
    const existingShiftConstraints = constraints.filter(
      (c) => c.employeeId === selectedEmployee && c.date === day
    )

    // Determine the next state based on current constraints
    let nextType: "prefer" | "avoid" | null = null

    if (existingShiftConstraints.length === 0) {
      nextType = "prefer"
    } else if (existingShiftConstraints.every((c) => c.type === "prefer")) {
      nextType = "avoid"
    } else {
      nextType = null
    }

    // Set new constraints for all shifts if not removing
    if (nextType) {
      onSetConstraint(selectedEmployee, nextType, day)
    } else {
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
      const daySchedule = schedule[day]

      // Get all shift constraints for this day to determine overall day state
      const shiftConstraints = selectedEmployee
        ? constraints.filter(
            (c) =>
              c.employeeId === selectedEmployee &&
              c.date === day &&
              "shiftIndex" in c
          )
        : []

      // Determine the overall day constraint state
      let dayConstraintType: "prefer" | "avoid" | null = null
      if (shiftConstraints.length > 0) {
        // If all shifts have the same constraint type, show that as day constraint
        const allPrefer = shiftConstraints.every((c) => c.type === "prefer")
        const allAvoid = shiftConstraints.every((c) => c.type === "avoid")
        if (allPrefer) dayConstraintType = "prefer"
        else if (allAvoid) dayConstraintType = "avoid"
      }

      // Calculate position for border logic
      const totalCells = firstDay + daysInMonth
      const cellIndex = firstDay + day - 1
      const isLastInRow = (cellIndex + 1) % 7 === 0
      const isInLastRow = cellIndex >= Math.floor(totalCells / 7) * 7

      let cellClass = "p-1 min-h-24 border-gray-200 "

      // Add borders except for last column and last row
      if (!isLastInRow) cellClass += "border-r "
      if (!isInLastRow) cellClass += "border-b "

      // Base styling for constraint interaction
      if (selectedEmployee) {
        cellClass += "transition-colors "
      }

      cells.push(
        <div key={day} className={cellClass}>
          {/* Day number header */}
          <div className="text-sm font-medium mb-1 flex justify-between items-center">
            <span>{day}</span>
            {selectedEmployee && dayConstraintType && (
              <span
                className={`text-xs px-1 rounded ${
                  dayConstraintType === "prefer"
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                Day {dayConstraintType === "prefer" ? "✓" : "✗"}
              </span>
            )}
          </div>

          {/* Shift containers */}
          <div className="space-y-0.5">
            {Array.from({ length: settings.shiftsPerDay }, (_, shiftIndex) => {
              const shift = daySchedule?.shifts?.[shiftIndex]
              const shiftEmployees = shift?.employeeIds || []
              const shiftLabel =
                settings.shiftLabels?.[shiftIndex] || `Shift ${shiftIndex + 1}`

              // Find shift-specific constraint
              const shiftConstraint = selectedEmployee
                ? constraints.find(
                    (c) =>
                      c.employeeId === selectedEmployee &&
                      c.date === day &&
                      "shiftIndex" in c &&
                      c.shiftIndex === shiftIndex
                  )
                : null

              // Check if selected employee is in this specific shift
              const isSelectedInThisShift =
                selectedEmployee && shiftEmployees.includes(selectedEmployee)

              let shiftClass =
                "text-xs p-1 rounded border min-h-6 cursor-pointer transition-colors "

              if (selectedEmployee) {
                // Apply shift-specific constraint styling
                if (isSelectedInThisShift) {
                  if (shiftConstraint?.type === "prefer") {
                    shiftClass +=
                      "bg-green-200 hover:bg-green-300 border-green-400 text-green-800 "
                  } else if (shiftConstraint?.type === "avoid") {
                    shiftClass +=
                      "bg-red-200 hover:bg-red-300 border-red-400 text-red-800 "
                  } else {
                    shiftClass +=
                      "bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-800 "
                  }
                } else {
                  // Constraint styling when employee is not scheduled
                  if (shiftConstraint?.type === "prefer") {
                    shiftClass +=
                      "bg-green-50 hover:bg-green-100 border-green-200 text-green-700 "
                  } else if (shiftConstraint?.type === "avoid") {
                    shiftClass +=
                      "bg-red-50 hover:bg-red-100 border-red-200 text-red-700 "
                  } else {
                    shiftClass += "hover:bg-blue-25 border-gray-200 "
                  }
                }
              } else {
                shiftClass += "border-gray-200 "
              }

              return (
                <div
                  key={`${day}-shift-${shiftIndex}`}
                  className={shiftClass}
                  onClick={() =>
                    selectedEmployee && handleShiftClick(day, shiftIndex)
                  }
                  title={`${shiftLabel} - Click to set preference`}
                >
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-medium text-[10px] text-gray-600">
                      {settings.shiftsPerDay > 1
                        ? shiftLabel.split(" ")[1] || shiftLabel
                        : ""}
                    </span>
                    {shiftConstraint && (
                      <span
                        className={`text-[8px] px-0.5 rounded ${
                          shiftConstraint.type === "prefer"
                            ? "bg-green-300 text-green-900"
                            : "bg-red-300 text-red-900"
                        }`}
                      >
                        {shiftConstraint.type === "prefer" ? "✓" : "✗"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {shiftEmployees.map((empId) => {
                      const employee = employees.find((emp) => emp.id === empId)
                      const isCurrentSelectedEmployee =
                        selectedEmployee === empId
                      return (
                        <div
                          key={`${empId}-${day}-${shiftIndex}`}
                          className={`text-[10px] truncate ${
                            isCurrentSelectedEmployee ? "font-bold" : ""
                          }`}
                          title={employee?.name}
                        >
                          {employee?.name}
                        </div>
                      )
                    })}
                    {shiftEmployees.length === 0 && (
                      <div className="text-[10px] text-gray-400 italic">
                        Unassigned
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day-level constraint button for multi-shift days */}
          {selectedEmployee && settings.shiftsPerDay > 1 && (
            <button
              onClick={() => handleDayClick(day)}
              className={`mt-1 w-full text-[10px] py-0.5 px-1 rounded border transition-colors ${
                dayConstraintType === "prefer"
                  ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                  : dayConstraintType === "avoid"
                  ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
              title="Set preference for all shifts on this day"
            >
              {dayConstraintType
                ? `All shifts: ${dayConstraintType}`
                : "Set all shifts"}
            </button>
          )}
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
                  {settings.shiftsPerDay > 1
                    ? t("shiftPreferences.clickShiftToSet")
                    : t("schedule.clickToSetPreferences")}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>
                      {settings.shiftsPerDay > 1
                        ? t("shiftPreferences.preferredShifts")
                        : t("schedule.preferredDays")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>
                      {settings.shiftsPerDay > 1
                        ? t("shiftPreferences.avoidShifts")
                        : t("schedule.avoidDays")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>
                      {settings.shiftsPerDay > 1
                        ? t("shiftPreferences.normalShifts")
                        : t("schedule.normalDays")}
                    </span>
                  </div>
                  {settings.shiftsPerDay > 1 && (
                    <div className="mt-2 pt-2 border-t border-blue-200">
                      <div className="text-xs text-blue-700">
                        {t("shiftPreferences.shiftSpecific")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
