import { Calendar, Table, List, BarChart3 } from "lucide-react"

export type ScheduleViewType = "calendar" | "spreadsheet" | "list" | "gantt"

export interface ViewConfiguration {
  type: ScheduleViewType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  supportsConstraints: boolean
}

export const VIEW_CONFIGURATIONS: Record<ScheduleViewType, ViewConfiguration> =
  {
    calendar: {
      type: "calendar",
      label: "Calendar View",
      icon: Calendar,
      description: "Traditional calendar layout showing days and shifts",
      supportsConstraints: true,
    },
    spreadsheet: {
      type: "spreadsheet",
      label: "Spreadsheet View",
      icon: Table,
      description: "Employee rows × day columns with shift assignments",
      supportsConstraints: false,
    },
    list: {
      type: "list",
      label: "List View",
      icon: List,
      description: "Simple list of employee assignments",
      supportsConstraints: false,
    },
    gantt: {
      type: "gantt",
      label: "Timeline View",
      icon: BarChart3,
      description: "Gantt chart showing employee schedules over time",
      supportsConstraints: false,
    },
  }

export const AVAILABLE_VIEWS: ScheduleViewType[] = ["calendar", "spreadsheet"]
