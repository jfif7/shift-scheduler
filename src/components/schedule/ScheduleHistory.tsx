import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

interface ScheduleHistoryProps {
  schedules: ScheduleItem[]
  activeScheduleId: string | null
  onScheduleSelect: (scheduleId: string | null) => void
  onScheduleAdd: (
    month: number,
    year: number,
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
  const [importFromScheduleId, setImportFromScheduleId] =
    useState<string>("auto")

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the most recent schedule for auto-import
  const getMostRecentSchedule = () => {
    if (schedules.length === 0) return null
    const sorted = [...schedules].sort((a, b) => {
      const dateA = new Date(a.year, a.month)
      const dateB = new Date(b.year, b.month)
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
    return sorted[0]
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
    if (!newMonth || !newYear) {
      toast.error("Invalid input", {
        description: "Please select both month and year.",
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

      onScheduleAdd(newMonth, newYear, importScheduleId)
      setIsAddingSchedule(false)
      setNewMonth(null)
      setNewYear(null)
      setImportFromScheduleId("auto")

      const importMessage = importScheduleId
        ? " with imported employees"
        : " with empty employee list"

      toast.success("Schedule created", {
        description: `${getMonthName(
          newMonth
        )} ${newYear} schedule has been created${importMessage}.`,
      })
    } catch (error) {
      toast.error("Creation failed", {
        description:
          error instanceof Error ? error.message : "Failed to create schedule.",
      })
    }
  }

  const handleDeleteSchedule = (
    scheduleId: string,
    month: number,
    year: number
  ) => {
    onScheduleDelete(scheduleId)
    toast.success("Schedule deleted", {
      description: `${getMonthName(month)} ${year} schedule has been deleted.`,
    })
  }

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = new Date(a.year, a.month)
    const dateB = new Date(b.year, b.month)
    // Most recent first
    return dateB.getTime() - dateA.getTime()
  })

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ]

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i
    return { value: year.toString(), label: year.toString() }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule History
          </CardTitle>
          <Button
            onClick={() => {
              const { month, year } = getNextMonthYear()
              setIsAddingSchedule(true)
              setNewMonth(month)
              setNewYear(year)
              setImportFromScheduleId("auto")
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </Button>
        </div>
        {schedules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No schedules created yet.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Schedule Form */}
        {isAddingSchedule && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <h4 className="font-medium">Create New Schedule</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Month</label>
                <Select
                  value={newMonth?.toString() || ""}
                  onValueChange={(value) => setNewMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
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
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={newYear?.toString() || ""}
                  onValueChange={(value) => setNewYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
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
                <label className="text-sm font-medium">Employee Import</label>
                <Select
                  value={importFromScheduleId}
                  onValueChange={setImportFromScheduleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose import option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Auto-import from most recent schedule
                    </SelectItem>
                    <SelectItem value="none">
                      Start with empty employee list
                    </SelectItem>
                    {sortedSchedules.map((schedule) => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        Copy from {getMonthName(schedule.month)} {schedule.year}{" "}
                        ({schedule.employees.length} employees)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Imported employees become independent copies - changes
                  won&apos;t affect the original schedule.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleAddSchedule} size="sm">
                Create Schedule
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
                Cancel
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
                      <span className="font-medium">
                        {getMonthName(schedule.month)} {schedule.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {schedule.employees.length} employees
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
                  Created: {schedule.createdAt.toLocaleDateString()}
                  {schedule.isGenerated && (
                    <span className="ml-2 text-green-600">• Generated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
