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
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, CheckCircle, Circle } from "lucide-react"
import { ScheduleItem } from "@/types/schedule"
import { getMonthName } from "@/utils/dateUtils"
import { toast } from "sonner"

interface ScheduleHistoryProps {
  schedules: ScheduleItem[]
  activeScheduleId: string | null
  onScheduleSelect: (scheduleId: string) => void
  onScheduleAdd: (month: string, year: string) => void
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
  const [newMonth, setNewMonth] = useState("")
  const [newYear, setNewYear] = useState("")

  const currentDate = new Date()
  const currentMonth = (currentDate.getMonth() + 1).toString()
  const currentYear = currentDate.getFullYear().toString()

  const handleAddSchedule = () => {
    if (!newMonth || !newYear) {
      toast.error("Invalid input", {
        description: "Please select both month and year.",
      })
      return
    }

    try {
      onScheduleAdd(newMonth, newYear)
      setIsAddingSchedule(false)
      setNewMonth("")
      setNewYear("")
      toast.success("Schedule created", {
        description: `${getMonthName(
          newMonth
        )} ${newYear} schedule has been created.`,
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
    month: string,
    year: string
  ) => {
    onScheduleDelete(scheduleId)
    toast.success("Schedule deleted", {
      description: `${getMonthName(month)} ${year} schedule has been deleted.`,
    })
  }

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = new Date(parseInt(a.year), parseInt(a.month) - 1)
    const dateB = new Date(parseInt(b.year), parseInt(b.month) - 1)
    return dateA.getTime() - dateB.getTime()
  })

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
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
              setIsAddingSchedule(true)
              setNewMonth(currentMonth)
              setNewYear(currentYear)
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
                <Select value={newMonth} onValueChange={setNewMonth}>
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
                <Select value={newYear} onValueChange={setNewYear}>
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
            <div className="flex gap-2">
              <Button onClick={handleAddSchedule} size="sm">
                Create Schedule
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingSchedule(false)
                  setNewMonth("")
                  setNewYear("")
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
                onClick={() => onScheduleSelect(schedule.id)}
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
                    {schedule.id === activeScheduleId && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
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
