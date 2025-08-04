"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Users,
  History,
} from "lucide-react"
import { ScheduleHistory } from "@/components/schedule/ScheduleHistory"
import { EmployeeManager } from "@/components/schedule/EmployeeManager"
import { ConstraintsPanel } from "@/components/schedule/ConstraintsPanel"
import { ScheduleContainer } from "@/components/schedule/ScheduleContainer"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { AboutPage } from "@/components/AboutPage"
import { useScheduleData } from "@/hooks/useScheduleData"
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement"
import { useConstraintManagement } from "@/hooks/useConstraintManagement"
import { useScheduleGeneration } from "@/hooks/useScheduleGeneration"
import { useCollapsibleLayout } from "@/hooks/useCollapsibleLayout"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ScheduleSettings, ScheduleItem } from "@/types/schedule"

export default function ScheduleManager() {
  const t = useTranslations()

  const PREDEFINED_TAGS = ["tags.weekendType", "tags.rookie", "tags.veteran"]
  const {
    // Schedule history management
    schedules,
    activeScheduleId,
    setActiveScheduleId,
    addSchedule,
    addPredefinedSchedule,
    deleteSchedule,

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
  } = useScheduleData()

  const { addEmployee, removeEmployee, updateEmployee, toggleEmployeeTag } =
    useEmployeeManagement(
      employees,
      setEmployees,
      constraints,
      setConstraints,
      schedule,
      setSchedule,
      t
    )

  const applyShiftsToAll = (shiftsData: {
    shiftsPerMonth: [number, number]
    weekdayShifts: [number, number]
    weekendShifts: [number, number]
  }) => {
    const updatedEmployees = employees.map((emp) => ({
      ...emp,
      shiftsPerMonth: shiftsData.shiftsPerMonth,
      weekdayShifts: shiftsData.weekdayShifts,
      weekendShifts: shiftsData.weekendShifts,
    }))
    setEmployees(updatedEmployees)

    toast.success(t("employees.applyToAllEmployees"), {
      description: `${employees.length} employees updated`,
    })
  }

  const {
    removeConstraint,
    setShiftConstraint,
    setAllShiftsConstraint,
    setAllDaysConstraints,
  } = useConstraintManagement(constraints, setConstraints)

  // Unified constraint handler for both day and shift level
  const handleSetConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number,
    shiftIndex?: number
  ) => {
    if (shiftIndex === undefined) {
      setAllShiftsConstraint(employeeId, type, date, settings.shiftsPerDay)
    } else {
      setShiftConstraint(employeeId, type, date, shiftIndex)
    }
  }

  const handleToggleAllShifts = (shiftIndex: number) => {
    if (!selectedEmployee) return

    // Get all constraints for this employee and shift across all days
    const shiftConstraints = constraints.filter(
      (c) => c.employeeId === selectedEmployee && c.shiftIndex === shiftIndex
    )

    // Determine the current state
    let nextType: "prefer" | "avoid" | null = null

    if (shiftConstraints.length === 0) {
      nextType = "avoid"
    } else if (shiftConstraints.every((c) => c.type === "avoid")) {
      nextType = "prefer"
    } else {
      nextType = null // Remove all constraints
    }

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    // Use batch constraint function
    setAllDaysConstraints(
      selectedEmployee,
      nextType,
      days,
      settings.shiftsPerDay,
      shiftIndex
    )
  }

  const { isGenerating, handleGenerateSchedule } = useScheduleGeneration()

  const {
    isEmployeePanelCollapsed: isSidePanelCollapsed,
    toggleEmployeePanel,
  } = useCollapsibleLayout()

  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [leftPanelTab, setLeftPanelTab] = useState<"history" | "employees">(
    "history"
  )
  const [activeTab, setActiveTab] = useState<string>("about")

  const handleLoadDemo = (
    schedule: ScheduleItem,
    demoSettings: ScheduleSettings
  ) => {
    setSettings(demoSettings)
    addPredefinedSchedule(schedule)

    setActiveTab("setup")
  }

  const onGenerateSchedule = () => {
    handleGenerateSchedule(
      employees,
      constraints,
      settings,
      selectedMonth,
      selectedYear,
      setSchedule
    )
  }

  const handleClearAllData = () => {
    const confirmed = window.confirm(t("dataManagement.clearAllDataConfirm"))
    if (confirmed) {
      // Clear all localStorage data
      localStorage.removeItem("scheduleData")
      localStorage.removeItem("locale")

      // Show success message
      toast.success(t("dataManagement.dataCleared"))

      // Reload the page to reset all state
      window.location.reload()
    }
  }

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-0"
      >
        <TabsList className="w-full">
          <div className="w-full flex justify-between items-center px-6">
            <div className="flex">
              <TabsTrigger value="about" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                About
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("page.setup")}
              </TabsTrigger>
              <TabsTrigger
                value="constraints"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t("page.constraints")}
              </TabsTrigger>
            </div>
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </TabsList>

        <TabsContent value="about" className="mt-0">
          <AboutPage
            onClearAllData={handleClearAllData}
            onLoadDemo={handleLoadDemo}
          />
        </TabsContent>

        <TabsContent value="setup" className="mt-0">
          <div
            className={
              "container mx-auto p-6 transition-all duration-300 max-w-none"
            }
          >
            <div className="space-y-6">
              {/* Collapsible Layout */}
              <div className="relative">
                {/* Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleEmployeePanel}
                  className="mb-4 shadow-sm hover:shadow-md transition-all"
                  title={
                    isSidePanelCollapsed
                      ? "Show side panel (Ctrl+B)"
                      : "Hide side panel (Ctrl+B)"
                  }
                >
                  {isSidePanelCollapsed ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      <ChevronRight className="w-4 h-4" />
                      <span className="ml-1">
                        {t("employees.showSidePanel")}
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      <span>{t("employees.hideSidePanel")}</span>
                    </>
                  )}
                </Button>

                {/* Dynamic Layout */}
                <div
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    isSidePanelCollapsed
                      ? "grid grid-cols-1 gap-6"
                      : "grid grid-cols-1 xl:grid-cols-4 gap-6"
                  )}
                >
                  {/* Side Panel with Tabs - Conditional Rendering */}
                  {!isSidePanelCollapsed && (
                    <div className="transition-all duration-300">
                      <Tabs
                        value={leftPanelTab}
                        onValueChange={(value) =>
                          setLeftPanelTab(value as "history" | "employees")
                        }
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger
                            value="history"
                            className="flex items-center gap-2"
                          >
                            <History className="w-4 h-4" />
                            {t("scheduleHistory.title")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="employees"
                            className="flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            {t("employees.title")}
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="history" className="mt-4">
                          <ScheduleHistory
                            schedules={schedules}
                            activeScheduleId={activeScheduleId}
                            onScheduleSelect={setActiveScheduleId}
                            onScheduleAdd={addSchedule}
                            onScheduleDelete={deleteSchedule}
                          />
                        </TabsContent>

                        <TabsContent value="employees" className="mt-4">
                          <EmployeeManager
                            employees={employees}
                            selectedEmployee={selectedEmployee}
                            onEmployeeSelect={setSelectedEmployee}
                            onAddEmployee={addEmployee}
                            onRemoveEmployee={removeEmployee}
                            onUpdateEmployee={updateEmployee}
                            onToggleTag={toggleEmployeeTag}
                            onApplyShiftsToAll={applyShiftsToAll}
                            predefinedTags={PREDEFINED_TAGS}
                            hasActiveSchedule={activeScheduleId !== null}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Schedule Panel - Dynamic Span */}
                  <div
                    className={cn(
                      "transition-all duration-300",
                      isSidePanelCollapsed ? "col-span-2" : "xl:col-span-3"
                    )}
                  >
                    <ScheduleContainer
                      schedule={schedule}
                      employees={employees}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      hasActiveSchedule={activeScheduleId !== null}
                      constraints={constraints}
                      selectedEmployee={selectedEmployee}
                      settings={settings}
                      onSetConstraint={handleSetConstraint}
                      onRemoveConstraint={removeConstraint}
                      onToggleAllShifts={handleToggleAllShifts}
                      onGenerateSchedule={onGenerateSchedule}
                      isGenerating={isGenerating}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="constraints" className="mt-0">
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="space-y-6">
              <ConstraintsPanel
                settings={settings}
                onSettingsChange={setSettings}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
