import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Employee, Schedule, Constraint } from "@/types/schedule"
import { FileSpreadsheet, FileImage, ChevronDown } from "lucide-react"
import { exportScheduleAsCSV, exportScheduleAsImage } from "@/utils/exportUtils"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
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
      toast.error("No schedule", {
        description: "Please generate a schedule first.",
      })
      return
    }

    try {
      exportScheduleAsCSV(schedule, employees, selectedMonth, selectedYear)
      toast.success("CSV exported", {
        description: "Schedule has been exported as CSV file.",
      })
    } catch {
      toast.error("Export failed", {
        description: "Failed to export CSV file.",
      })
    }
    setShowExportDropdown(false)
  }

  const handleExportImage = () => {
    if (Object.keys(schedule).length === 0) {
      toast.error("No schedule", {
        description: "Please generate a schedule first.",
      })
      return
    }

    try {
      exportScheduleAsImage(schedule, employees, selectedMonth, selectedYear)
      toast.success("Image exported", {
        description: "Schedule has been exported as PNG image.",
      })
    } catch {
      toast.error("Export failed", {
        description: "Failed to export image file.",
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
      cells.push(<div key={`empty-${i}`} className="p-2 h-16"></div>)
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

      let cellClass = "p-2 h-16 border rounded-lg "

      // Apply constraint styling if selectedEmployee is set
      if (selectedEmployee) {
        cellClass += "cursor-pointer transition-colors "

        // If selected employee is scheduled, add special highlighting
        if (isSelectedEmployeeScheduled) {
          if (existingConstraint?.type === "prefer") {
            cellClass +=
              "bg-green-200 border-green-400 hover:bg-green-300 ring-2 ring-blue-400"
          } else if (existingConstraint?.type === "avoid") {
            cellClass +=
              "bg-red-200 border-red-400 hover:bg-red-300 ring-2 ring-blue-400"
          } else {
            cellClass +=
              "bg-blue-100 border-blue-400 hover:bg-blue-200 ring-2 ring-blue-400"
          }
        } else {
          // Normal constraint styling when employee is not scheduled
          if (existingConstraint?.type === "prefer") {
            cellClass += "bg-green-100 border-green-300 hover:bg-green-200"
          } else if (existingConstraint?.type === "avoid") {
            cellClass += "bg-red-100 border-red-300 hover:bg-red-200"
          } else {
            cellClass += "hover:border-blue-300 hover:bg-blue-50"
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
                key={empId}
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
          {"Schedule & Preferences"}
          <div className="flex gap-2">
            {onGenerateSchedule && (
              <Button
                onClick={onGenerateSchedule}
                disabled={employees.length === 0 || isGenerating}
                size="sm"
              >
                {isGenerating ? "Generating..." : "Generate Schedule"}
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
                  Export
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showExportDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <button
                      onClick={handleExportCSV}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Export as CSV
                    </button>
                    <button
                      onClick={handleExportImage}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileImage className="w-4 h-4" />
                      Export as Image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardTitle>
        {selectedEmployee && (
          <p className="text-sm text-muted-foreground">
            Setting preferences for:{" "}
            <strong>
              {employees.find((emp) => emp.id === selectedEmployee)?.name}
            </strong>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!hasActiveSchedule && (
          <p className="text-muted-foreground">
            No active schedule selected. Please select a schedule from the
            schedule history above to view its generated schedule.
          </p>
        )}

        {hasActiveSchedule && (
          <div>
            <h3 className="font-medium mb-4">
              {getMonthName(selectedMonth)} {selectedYear} Schedule
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center font-medium bg-muted rounded"
                >
                  {day}
                </div>
              ))}
              {renderScheduleGrid()}
            </div>

            {selectedEmployee && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  Click on days to set preferences:
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Preferred days (✓)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                    <span>Avoid days (✗)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>Normal days</span>
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
