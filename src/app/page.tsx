"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Settings, Info } from "lucide-react"
import { ScheduleHistory } from "@/components/schedule/ScheduleHistory"
import { EmployeeManager } from "@/components/schedule/EmployeeManager"
import { ConstraintsPanel } from "@/components/schedule/ConstraintsPanel"
import { ScheduleView } from "@/components/schedule/ScheduleView"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useScheduleData } from "@/hooks/useScheduleData"
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement"
import { useConstraintManagement } from "@/hooks/useConstraintManagement"
import { useScheduleGeneration } from "@/hooks/useScheduleGeneration"
import { useTranslations } from "next-intl"

export default function ScheduleManager() {
  const t = useTranslations()

  const PREDEFINED_TAGS = ["tags.weekendType", "tags.rookie", "tags.veteran"]
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
      setSchedule,
      t
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
    <div>
      <Tabs defaultValue="about" className="space-y-0">
        <TabsList className="w-full">
          <div className="container flex justify-between items-center">
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
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="space-y-6">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">{t("page.title")}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t("page.description")}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="mt-0">
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="space-y-6">
              <ScheduleHistory
                schedules={schedules}
                activeScheduleId={activeScheduleId}
                onScheduleSelect={setActiveScheduleId}
                onScheduleAdd={addSchedule}
                onScheduleDelete={deleteSchedule}
              />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                <div className="xl:col-span-2">
                  <ScheduleView
                    schedule={schedule}
                    employees={employees}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    hasActiveSchedule={activeScheduleId !== null}
                    constraints={constraints}
                    selectedEmployee={selectedEmployee}
                    onSetConstraint={setConstraint}
                    onRemoveConstraint={removeConstraint}
                    onGenerateSchedule={onGenerateSchedule}
                    isGenerating={isGenerating}
                  />
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
