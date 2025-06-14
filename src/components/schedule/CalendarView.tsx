import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Employee, Constraint } from "@/types/schedule"
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
} from "@/utils/dateUtils"

interface CalendarViewProps {
  selectedMonth: string
  selectedYear: string
  selectedEmployee: string
  employees: Employee[]
  constraints: Constraint[]
  onSetConstraint: (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number
  ) => void
  onRemoveConstraint: (employeeId: string, date: number) => void
}

export const CalendarView = ({
  selectedMonth,
  selectedYear,
  selectedEmployee,
  employees,
  constraints,
  onSetConstraint,
  onRemoveConstraint,
}: CalendarViewProps) => {
  const handleDayClick = (day: number) => {
    if (!selectedEmployee) return

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

  const renderCalendarDays = () => {
    if (!selectedMonth || !selectedYear) return null

    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const cells = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="p-2 h-8"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Find existing constraint for this employee and day
      const existingConstraint = constraints.find(
        (c) => c.employeeId === selectedEmployee && c.date === day
      )

      let cellClass =
        "p-1 h-8 text-xs border rounded cursor-pointer transition-colors flex items-center justify-center "

      if (!selectedEmployee) {
        cellClass += "border-gray-200 hover:border-gray-300"
      } else if (existingConstraint?.type === "prefer") {
        cellClass +=
          "bg-green-200 border-green-400 text-green-800 hover:bg-green-300"
      } else if (existingConstraint?.type === "avoid") {
        cellClass += "bg-red-200 border-red-400 text-red-800 hover:bg-red-300"
      } else {
        // Normal state (no constraint)
        cellClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      }

      cells.push(
        <div
          key={day}
          className={cellClass}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </div>
      )
    }

    return cells
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedMonth && selectedYear
            ? `${getMonthName(selectedMonth)} ${selectedYear}`
            : "Calendar"}
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
        {!selectedMonth || !selectedYear ? (
          <p className="text-muted-foreground">
            Select a month and year to view calendar
          </p>
        ) : (
          <div className="space-y-2">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={index}
                  className="p-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
          </div>
        )}

        {selectedEmployee && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Legend:
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                <span>Preferred days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                <span>Avoid days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                <span>Normal days</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
