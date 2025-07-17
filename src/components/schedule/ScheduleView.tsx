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
import { ScheduleCell } from "./ScheduleCell"

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
        c.shiftIndex === shiftIndex
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
    const totalCells = firstDay + daysInMonth

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const isLastInRow = (i + 1) % 7 === 0
      const isInLastRow = i >= Math.floor(totalCells / 7) * 7

      let emptyCellClass = "p-2 min-h-20 border-gray-200 "
      if (!isLastInRow) emptyCellClass += "border-r "
      if (!isInLastRow) emptyCellClass += "border-b "

      cells.push(<div key={`empty-${i}`} className={emptyCellClass}></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const daySchedule = schedule[day]

      // Calculate position for border logic
      const cellIndex = firstDay + day - 1
      const isLastInRow = (cellIndex + 1) % 7 === 0
      const isInLastRow = cellIndex >= Math.floor(totalCells / 7) * 7

      cells.push(
        <ScheduleCell
          key={day}
          day={day}
          daySchedule={daySchedule}
          employees={employees}
          constraints={constraints}
          selectedEmployee={selectedEmployee}
          settings={settings}
          isLastInRow={isLastInRow}
          isInLastRow={isInLastRow}
          onShiftClick={handleShiftClick}
          onDayClick={handleDayClick}
        />
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
