import {
  Employee,
  Schedule,
  Constraint,
  ScheduleSettings,
} from "@/types/schedule"
import { ScheduleViewType } from "@/types/viewTypes"
import { CalendarView } from "./views/CalendarView"
import { SpreadsheetView } from "./views/SpreadsheetView"

interface ViewRendererProps {
  currentView: ScheduleViewType
  schedule: Schedule
  employees: Employee[]
  selectedMonth: number
  selectedYear: number
  constraints?: Constraint[]
  selectedEmployee?: string
  settings: ScheduleSettings
  showShiftColors: boolean
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
  onShiftClick: (day: number, shiftIndex: number) => void
  onDayClick: (day: number) => void
}

export const ViewRenderer = ({
  currentView,
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  constraints = [],
  selectedEmployee,
  settings,
  showShiftColors,
  onSetConstraint,
  onRemoveConstraint,
  onShiftClick,
  onDayClick,
}: ViewRendererProps) => {
  switch (currentView) {
    case "calendar":
      return (
        <CalendarView
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
          onShiftClick={onShiftClick}
          onDayClick={onDayClick}
        />
      )

    case "spreadsheet":
      return (
        <SpreadsheetView
          schedule={schedule}
          employees={employees}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          settings={settings}
          showShiftColors={showShiftColors}
        />
      )

    case "list":
    case "gantt":
      return (
        <div className="text-center py-8 text-muted-foreground">
          {currentView.charAt(0).toUpperCase() + currentView.slice(1)} view
          coming soon...
        </div>
      )

    default:
      return (
        <div className="text-center py-8 text-red-500">
          Unknown view type: {currentView}
        </div>
      )
  }
}
