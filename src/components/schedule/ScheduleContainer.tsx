import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Employee,
  Schedule,
  Constraint,
  ScheduleSettings,
} from "@/types/schedule"
import { ScheduleViewType, VIEW_CONFIGURATIONS } from "@/types/viewTypes"
import { exportScheduleAsCSV, exportScheduleAsImage } from "@/utils/exportUtils"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { getMonthName } from "@/utils/dateUtils"
import { ViewSelector } from "./ViewSelector"
import { ViewToolbar } from "./ViewToolbar"
import { ViewRenderer } from "./ViewRenderer"
import { ShiftLegend } from "./ShiftLegend"
import { ServerStatus } from "./ServerStatus"

interface ScheduleContainerProps {
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
  onToggleAllShifts: (shiftIndex: number) => void
  onGenerateSchedule?: () => void
  isGenerating?: boolean
}

export const ScheduleContainer = ({
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
  onToggleAllShifts,
  onGenerateSchedule,
  isGenerating = false,
}: ScheduleContainerProps) => {
  const [currentView, setCurrentView] = useState<ScheduleViewType>("calendar")
  const [showShiftColors, setShowShiftColors] = useState(true)
  const t = useTranslations()

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("schedule-view-preference")
    if (
      savedView &&
      (savedView === "calendar" || savedView === "spreadsheet")
    ) {
      setCurrentView(savedView as ScheduleViewType)
    }
  }, [])

  // Save view preference to localStorage
  const handleViewChange = (view: ScheduleViewType) => {
    setCurrentView(view)
    localStorage.setItem("schedule-view-preference", view)
  }

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
      // Currently normal → change to avoid
      onSetConstraint(selectedEmployee, "avoid", day, shiftIndex)
    } else if (existingConstraint.type === "avoid") {
      // Currently avoid → change to prefer
      onSetConstraint(selectedEmployee, "prefer", day, shiftIndex)
    } else if (existingConstraint.type === "prefer") {
      // Currently prefer → change to normal (remove constraint)
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
      nextType = "avoid"
    } else if (existingShiftConstraints.every((c) => c.type === "avoid")) {
      nextType = "prefer"
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

  const currentViewConfig = VIEW_CONFIGURATIONS[currentView]

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
            {selectedEmployee && currentViewConfig.supportsConstraints && (
              <p className="text-sm text-muted-foreground">
                {t("schedule.settingPreferencesFor")}{" "}
                <strong>
                  {employees.find((emp) => emp.id === selectedEmployee)?.name}
                </strong>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <ViewSelector
              currentView={currentView}
              onViewChange={handleViewChange}
            />

            <ShiftLegend
              settings={settings}
              selectedEmployee={selectedEmployee}
              showShiftColors={showShiftColors}
              onToggleAllShifts={onToggleAllShifts}
            />

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

            <ServerStatus />

            <ViewToolbar
              hasScheduleData={Object.keys(schedule).length > 0}
              settings={settings}
              showShiftColors={showShiftColors}
              onToggleShiftColors={() => setShowShiftColors(!showShiftColors)}
              onExportCSV={handleExportCSV}
              onExportImage={handleExportImage}
            />
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
          <ViewRenderer
            currentView={currentView}
            schedule={schedule}
            employees={employees}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            constraints={constraints}
            selectedEmployee={selectedEmployee}
            settings={settings}
            showShiftColors={showShiftColors}
            onSetConstraint={onSetConstraint}
            onRemoveConstraint={onRemoveConstraint}
            onShiftClick={handleShiftClick}
            onDayClick={handleDayClick}
          />
        )}
      </CardContent>
    </Card>
  )
}
