import {
  Employee,
  Constraint,
  ScheduleSettings,
  Schedule,
} from "@/types/schedule"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface ScheduleCellProps {
  day: number
  daySchedule: Schedule[number]
  employees: Employee[]
  constraints: Constraint[]
  selectedEmployee?: string
  settings: ScheduleSettings
  isLastInRow: boolean
  isInLastRow: boolean
  showShiftColors?: boolean
  onShiftClick: (day: number, shiftIndex: number) => void
  onDayClick: (day: number) => void
}

export const ScheduleCell = ({
  day,
  daySchedule,
  employees,
  constraints,
  selectedEmployee,
  settings,
  isLastInRow,
  isInLastRow,
  showShiftColors = false,
  onShiftClick,
  onDayClick,
}: ScheduleCellProps) => {
  const t = useTranslations()

  // Get all shift constraints for this day to determine overall day state
  const shiftConstraints = selectedEmployee
    ? constraints.filter(
        (c) => c.employeeId === selectedEmployee && c.date === day
      )
    : []

  // Determine the overall day constraint state
  let dayConstraintType: "prefer" | "avoid" | null = null
  if (shiftConstraints.length > 0) {
    // If all shifts have the same constraint type, show that as day constraint
    const allPrefer = shiftConstraints.every((c) => c.type === "prefer")
    const allAvoid = shiftConstraints.every((c) => c.type === "avoid")
    if (allPrefer) dayConstraintType = "prefer"
    else if (allAvoid) dayConstraintType = "avoid"
  }

  const cellClasses = ["p-1 min-h-24 border-gray-400 transition-colors"]
  if (!isLastInRow) cellClasses.push("border-r")
  if (!isInLastRow) cellClasses.push("border-b")

  return (
    <div className={cn(cellClasses)}>
      <div className="mb-1 relative flex justify-center items-center">
        {/* Day number header - always centered */}
        <span className="text-sm font-medium">{day}</span>
        {/* Day-level constraint button for multi-shift days */}
        {selectedEmployee && settings.shiftsPerDay > 1 && (
          <button
            onClick={() => onDayClick(day)}
            className={cn([
              "absolute right-0 text-[10px] border transition-colors truncate max-w-[calc(50%-0.5rem)]",
              `constraint-button-${dayConstraintType}`,
            ])}
            title={t("scheduleView.setAllShiftsDescription")}
          >
            {t(`scheduleView.setAllShifts_${dayConstraintType}`)}
          </button>
        )}
      </div>

      {/* Shift containers */}
      <div className="space-y-0.5">
        {Array.from({ length: settings.shiftsPerDay }, (_, shiftIndex) => {
          const shift = daySchedule?.shifts?.[shiftIndex]
          const shiftEmployees = shift?.employeeIds || []
          const shiftLabel =
            settings.shiftLabels?.[shiftIndex] || `Shift ${shiftIndex + 1}`

          const shiftConstraint = selectedEmployee
            ? shiftConstraints.find((c) => c.shiftIndex === shiftIndex)
            : null

          // Build class names for shift container
          const shiftClasses = [
            "text-xs border min-h-6 cursor-pointer transition-colors relative",
          ]
          if (showShiftColors && settings.shiftsPerDay > 1) {
            shiftClasses.push(`shift-${shiftIndex}`)
          }

          const isSelectedInThisShift =
            selectedEmployee && shiftEmployees.includes(selectedEmployee)
          if (isSelectedInThisShift) {
            shiftClasses.push("ring-2 ring-blue-400")
          }

          return (
            <div
              key={`${day}-shift-${shiftIndex}`}
              className={cn(shiftClasses)}
              onClick={() => selectedEmployee && onShiftClick(day, shiftIndex)}
              title={shiftLabel}
            >
              {/* Constraint indicator floating over content */}
              {shiftConstraint && (
                <div className="absolute top-0 right-0 z-10">
                  <span
                    className={cn([
                      "text-[8px] px-1 py-1 rounded text-white font-bold shadow-sm",
                      shiftConstraint.type === "prefer"
                        ? "bg-green-600"
                        : "bg-red-600",
                    ])}
                  >
                    {shiftConstraint.type === "prefer" ? "✓" : "✗"}
                  </span>
                </div>
              )}

              {/* Employee names grid */}
              <div className="space-y-0.5 grid grid-cols-[repeat(auto-fit,minmax(60px,1fr))] gap-0.5">
                {shiftEmployees.map((empId: string, idx: number) => {
                  const employee = employees.find((emp) => emp.id === empId)
                  const isCurrentSelectedEmployee = selectedEmployee === empId

                  return (
                    <div
                      key={`${empId}-${day}-${shiftIndex}-${idx}`}
                      className={cn(
                        "text-[10px] truncate",
                        isCurrentSelectedEmployee
                          ? "font-bold ring-1 ring-blue-400"
                          : ""
                      )}
                      title={employee?.name}
                    >
                      {employee?.name}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
