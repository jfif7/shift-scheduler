import { ScheduleSettings } from "@/types/schedule"

interface ShiftLegendProps {
  settings: ScheduleSettings
  showColors?: boolean
}

export const ShiftLegend = ({
  settings,
  showColors = true,
}: ShiftLegendProps) => {
  // Don't render legend when colors are hidden
  if (!showColors) {
    return null
  }

  return (
    <div className="shift-legend mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex flex-wrap gap-4">
        {settings.shiftLabels?.map((label, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded shift-${index} border`} />
            <span className="text-sm font-medium">{label}</span>
          </div>
        )) ||
          // Fallback for when no custom labels are defined
          Array.from({ length: settings.shiftsPerDay }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded shift-${index} border`} />
              <span className="text-sm font-medium">Shift {index + 1}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
