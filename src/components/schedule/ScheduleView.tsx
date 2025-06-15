import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Employee, Schedule } from "@/types/schedule"
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
} from "@/utils/dateUtils"

interface ScheduleViewProps {
  schedule: Schedule
  employees: Employee[]
  selectedMonth: string
  selectedYear: string
  hasActiveSchedule: boolean
}

export const ScheduleView = ({
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  hasActiveSchedule,
}: ScheduleViewProps) => {
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
      cells.push(
        <div key={day} className="p-2 h-16 border rounded-lg">
          <div className="text-sm font-medium">{day}</div>
          {assignedEmployees.map((empId) => {
            const employee = employees.find((emp) => emp.id === empId)
            return (
              <div
                key={empId}
                className="text-xs text-blue-600 truncate"
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
        <CardTitle>Generated Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasActiveSchedule ? (
          <p className="text-muted-foreground">
            No active schedule selected. Please select a schedule from the Setup
            tab to view its generated schedule.
          </p>
        ) : Object.keys(schedule).length === 0 ? (
          <p className="text-muted-foreground">
            No schedule generated yet. Click &quot;Generate Schedule&quot; to
            create one.
          </p>
        ) : (
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
