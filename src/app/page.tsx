"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Settings } from "lucide-react"
import { MonthSelector } from "@/components/schedule/MonthSelector"
import { EmployeeManager } from "@/components/schedule/EmployeeManager"
import { ConstraintsPanel } from "@/components/schedule/ConstraintsPanel"
import { CalendarView } from "@/components/schedule/CalendarView"
import { ScheduleView } from "@/components/schedule/ScheduleView"
import { ScheduleActions } from "@/components/schedule/ScheduleActions"
import { useScheduleData } from "@/hooks/useScheduleData"
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement"
import { useConstraintManagement } from "@/hooks/useConstraintManagement"
import { useScheduleGeneration } from "@/hooks/useScheduleGeneration"

const PREDEFINED_TAGS = [
  "Weekend type",
  "Burger",
  "Morning shift",
  "Evening shift",
  "Manager",
  "Part-time",
]

export default function ScheduleManager() {
  const {
    // Schedule history management
    schedules,
    activeScheduleId,
    setActiveScheduleId,
    addSchedule,
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
      setSchedule
    )

  const { setConstraint, removeConstraint } = useConstraintManagement(
    constraints,
    setConstraints
  )

  const { isGenerating, handleGenerateSchedule } = useScheduleGeneration()

  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule Manager</h1>
        <p className="text-muted-foreground">
          Manage employee schedules with constraints and preferences
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="constraints" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Constraints
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MonthSelector
                schedules={schedules}
                activeScheduleId={activeScheduleId}
                onScheduleSelect={setActiveScheduleId}
                onScheduleAdd={addSchedule}
                onScheduleDelete={deleteSchedule}
              />

              <EmployeeManager
                employees={employees}
                selectedEmployee={selectedEmployee}
                onEmployeeSelect={setSelectedEmployee}
                onAddEmployee={addEmployee}
                onRemoveEmployee={removeEmployee}
                onUpdateEmployee={updateEmployee}
                onToggleTag={toggleEmployeeTag}
                predefinedTags={PREDEFINED_TAGS}
                hasActiveSchedule={activeScheduleId !== null}
              />

              <CalendarView
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                selectedEmployee={selectedEmployee}
                employees={employees}
                constraints={constraints}
                onSetConstraint={setConstraint}
                onRemoveConstraint={removeConstraint}
                hasActiveSchedule={activeScheduleId !== null}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="constraints">
          <div className="space-y-6">
            <ConstraintsPanel
              settings={settings}
              onSettingsChange={setSettings}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-6">
            <ScheduleActions
              schedule={schedule}
              employees={employees}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onGenerateSchedule={onGenerateSchedule}
              isGenerating={isGenerating}
              hasActiveSchedule={activeScheduleId !== null}
            />
            <ScheduleView
              schedule={schedule}
              employees={employees}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              hasActiveSchedule={activeScheduleId !== null}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
