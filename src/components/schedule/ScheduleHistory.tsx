import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Calendar, CheckCircle, Circle } from "lucide-react"
import { ScheduleItem } from "@/types/schedule"
import { getMonthName } from "@/utils/dateUtils"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface ScheduleHistoryProps {
  schedules: ScheduleItem[]
  activeScheduleId: string | null
  onScheduleSelect: (scheduleId: string | null) => void
  onScheduleAdd: (
    month: number,
    year: number,
    name: string,
    importFromScheduleId?: string
  ) => void
  onScheduleDelete: (scheduleId: string) => void
}

export const ScheduleHistory = ({
  schedules,
  activeScheduleId,
  onScheduleSelect,
  onScheduleAdd,
  onScheduleDelete,
}: ScheduleHistoryProps) => {
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [newMonth, setNewMonth] = useState<number | null>(null)
  const [newYear, setNewYear] = useState<number | null>(null)
  const [newName, setNewName] = useState<string>("")
  const [newNameEdited, setNewNameEdited] = useState<boolean>(false)
  const [importFromScheduleId, setImportFromScheduleId] =
    useState<string>("auto")
  const t = useTranslations()

  // Auto-collapse when a schedule is selected
  const shouldShowCollapsed = activeScheduleId && !isAddingSchedule

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the most recent schedule for auto-import
  const getMostRecentSchedule = (): ScheduleItem | null => {
    if (schedules.length === 0) return null

    let mostRecent = schedules[0]
    for (let i = 1; i < schedules.length; i++) {
      const current = schedules[i]
      if (
        current.year > mostRecent.year ||
        (current.year === mostRecent.year && current.month > mostRecent.month)
      ) {
        mostRecent = current
      }
    }
    return mostRecent
  }
  // Get the next month/year after the latest schedule, or current month/year if no schedules
  const getNextMonthYear = () => {
    const mostRecent = getMostRecentSchedule()
    if (!mostRecent) {
      return {
        month: currentMonth,
        year: currentYear,
      }
    }

    const recentDate = new Date(mostRecent.year, mostRecent.month)
    const nextMonth = new Date(
      recentDate.getFullYear(),
      recentDate.getMonth() + 1
    )

    return {
      month: nextMonth.getMonth(),
      year: nextMonth.getFullYear(),
    }
  }

  const handleAddSchedule = () => {
    if (newMonth === null || newYear === null) {
      toast.error(t("toast.invalidInput"), {
        description: t("toast.selectAllFields"),
      })
      return
    }

    try {
      // Determine which schedule to import from
      let importScheduleId: string | undefined
      if (importFromScheduleId === "auto") {
        const mostRecent = getMostRecentSchedule()
        importScheduleId = mostRecent?.id
      } else if (importFromScheduleId !== "none") {
        importScheduleId = importFromScheduleId
      }

      onScheduleAdd(newMonth, newYear, newName.trim(), importScheduleId)
      setIsAddingSchedule(false)

      const importMessage = importScheduleId
        ? t("toast.withImportedEmployees")
        : t("toast.withEmptyEmployeeList")

      toast.success(t("toast.scheduleCreated"), {
        description: t("toast.scheduleCreatedDescription", {
          month: getMonthName(newMonth, t),
          year: newYear,
          importMessage,
        }),
      })
    } catch (error) {
      toast.error(t("toast.creationFailed"), {
        description:
          error instanceof Error
            ? error.message
            : t("toast.creationFailedDescription"),
      })
    }
  }

  const handleDeleteSchedule = (
    scheduleId: string,
    month: number,
    year: number
  ) => {
    onScheduleDelete(scheduleId)
    toast.success(t("toast.scheduleDeleted"), {
      description: t("toast.scheduleDeletedDescription", {
        month: getMonthName(month, t),
        year,
      }),
    })
  }

  const sortedSchedules = [...schedules].sort((a, b) => {
    // Most recent first
    return b.year - a.year || b.month - a.month
  })

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: t(`months.${i}`),
  }))

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i
    return { value: year.toString(), label: year.toString() }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t("scheduleHistory.title")}
          {shouldShowCollapsed && activeScheduleId && (
            <span className="text-sm font-normal text-muted-foreground">
              {(() => {
                const activeSchedule = schedules.find(
                  (s) => s.id === activeScheduleId
                )
                return activeSchedule
                  ? `${activeSchedule.name} - ${
                      activeSchedule.year
                    }/${getMonthName(activeSchedule.month, t)}`
                  : ""
              })()}
            </span>
          )}
        </CardTitle>

        <div className="flex items-center gap-2 pt-2">
          {shouldShowCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onScheduleSelect(null)}
              className="flex items-center gap-2"
            >
              {t("scheduleHistory.showAll")}
            </Button>
          )}
          <Button
            onClick={() => {
              const { month, year } = getNextMonthYear()
              setIsAddingSchedule(true)
              setNewMonth(month)
              setNewYear(year)
              setNewName(`${year} ${getMonthName(month, t)}`)
              setNewNameEdited(false)
              setImportFromScheduleId("auto")
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("scheduleHistory.addSchedule")}
          </Button>
        </div>

        {schedules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {t("scheduleHistory.noSchedulesYet")}
          </p>
        )}
      </CardHeader>
      {!shouldShowCollapsed && (
        <CardContent className="space-y-4">
          {/* Add Schedule Form */}
          {isAddingSchedule && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-medium">
                {t("scheduleHistory.createNewSchedule")}
              </h4>

              {/* Schedule Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("scheduleHistory.name")}
                </label>
                <Input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setNewNameEdited(true)
                  }}
                  placeholder={t("scheduleHistory.namePlaceholder")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    {t("scheduleHistory.month")}
                  </label>
                  <Select
                    value={newMonth?.toString() || ""}
                    onValueChange={(value) => {
                      const parsed = parseInt(value)
                      setNewMonth(parsed)
                      if (!newNameEdited) {
                        setNewName(`${newYear} ${getMonthName(parsed, t)}`)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("scheduleHistory.selectMonth")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("scheduleHistory.year")}
                  </label>
                  <Select
                    value={newYear?.toString() || ""}
                    onValueChange={(value) => {
                      const parsed = parseInt(value)
                      setNewYear(parsed)
                      if (!newNameEdited && newMonth) {
                        setNewName(`${parsed} ${getMonthName(newMonth, t)}`)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("scheduleHistory.selectYear")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employee Import Options */}
              {schedules.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("scheduleHistory.employeeImport")}
                  </label>
                  <Select
                    value={importFromScheduleId}
                    onValueChange={setImportFromScheduleId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("scheduleHistory.chooseImportOption")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">
                        {t("scheduleHistory.autoImportFromRecent")}
                      </SelectItem>
                      <SelectItem value="none">
                        {t("scheduleHistory.startWithEmptyList")}
                      </SelectItem>
                      {sortedSchedules.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {t("scheduleHistory.copyFrom")} {schedule.name} (
                          {getMonthName(schedule.month, t)} {schedule.year},{" "}
                          {schedule.employees.length}{" "}
                          {t("scheduleHistory.employees")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("scheduleHistory.importNote")}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleAddSchedule} size="sm">
                  {t("scheduleHistory.createSchedule")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingSchedule(false)
                    setNewMonth(null)
                    setNewYear(null)
                    setImportFromScheduleId("auto")
                  }}
                  size="sm"
                >
                  {t("scheduleHistory.cancel")}
                </Button>
              </div>
            </div>
          )}

          {/* Schedule List */}
          {sortedSchedules.length > 0 && (
            <div className="space-y-2">
              {sortedSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    schedule.id === activeScheduleId
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    if (schedule.id === activeScheduleId) {
                      onScheduleSelect(null)
                    } else {
                      onScheduleSelect(schedule.id)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {schedule.isGenerated ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{schedule.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {schedule.year} {getMonthName(schedule.month, t)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {schedule.employees.length}{" "}
                        {t("scheduleHistory.employees")}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSchedule(
                            schedule.id,
                            schedule.month,
                            schedule.year
                          )
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("scheduleHistory.created")}{" "}
                    {schedule.createdAt.toLocaleDateString()}
                    {schedule.isGenerated && (
                      <span className="ml-2 text-green-600">
                        • {t("scheduleHistory.generated")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
