import { cn } from "@/lib/utils"
import { Constraint, ScheduleSettings } from "@/types/schedule"

interface ShiftLegendProps {
  settings: ScheduleSettings
  selectedEmployee?: string
  constraints?: Constraint[]
  showShiftColors: boolean
  onToggleAllShifts?: (shiftIndex: number) => void
}

export const ShiftLegend = ({
  settings,
  selectedEmployee,
  showShiftColors,
  onToggleAllShifts,
}: ShiftLegendProps) => {

  if (settings.shiftsPerDay <= 1 || !showShiftColors) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground font-medium">
      </span>
      <div className="flex gap-2 shift-legend">
        {Array.from({ length: settings.shiftsPerDay }, (_, shiftIndex) => {
          const shiftLabel = settings.shiftLabels?.[shiftIndex] || ""
          const isClickable = selectedEmployee && onToggleAllShifts
          
          return (
            <div
              key={shiftIndex}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded border transition-all",
                `shift-${shiftIndex}`,
                isClickable && "cursor-pointer hover:scale-105 hover:shadow-sm",
                !isClickable && "cursor-default"
              )}
              onClick={() => isClickable && onToggleAllShifts(shiftIndex)}
            >
              <div
                className={cn(
                  "w-3 h-3 rounded border-2",
                  `shift-${shiftIndex}`
                )}
              />
              <span className="text-xs font-medium text-gray-700">
                {shiftLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
