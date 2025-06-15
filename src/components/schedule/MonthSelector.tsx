import { ScheduleHistory } from "./ScheduleHistory"
import { ScheduleItem } from "@/types/schedule"

interface MonthSelectorProps {
  schedules: ScheduleItem[]
  activeScheduleId: string | null
  onScheduleSelect: (scheduleId: string) => void
  onScheduleAdd: (month: string, year: string) => void
  onScheduleDelete: (scheduleId: string) => void
}

export const MonthSelector = ({
  schedules,
  activeScheduleId,
  onScheduleSelect,
  onScheduleAdd,
  onScheduleDelete,
}: MonthSelectorProps) => {
  return (
    <ScheduleHistory
      schedules={schedules}
      activeScheduleId={activeScheduleId}
      onScheduleSelect={onScheduleSelect}
      onScheduleAdd={onScheduleAdd}
      onScheduleDelete={onScheduleDelete}
    />
  )
}
