import {
  Employee,
  Constraint,
  ScheduleSettings,
  Schedule,
} from "@/types/schedule"

interface ScheduleCellProps {
  day: number
  daySchedule: Schedule[number]
  employees: Employee[]
  constraints: Constraint[]
  selectedEmployee?: string
  settings: ScheduleSettings
  isLastInRow: boolean
  isInLastRow: boolean
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
  onShiftClick,
  onDayClick,
}: ScheduleCellProps) => {
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

  let cellClass = "p-1 min-h-24 border-gray-200 "

  // Add borders except for last column and last row
  if (!isLastInRow) cellClass += "border-r "
  if (!isInLastRow) cellClass += "border-b "

  // Base styling for constraint interaction
  if (selectedEmployee) {
    cellClass += "transition-colors "
  }

  return (
    <div className={cellClass}>
      {/* Day number header */}
      <div className="text-sm font-medium mb-1 flex justify-between items-center">
        <span className="text-center">{day}</span>
        {/* Day-level constraint button for multi-shift days */}
        {selectedEmployee && settings.shiftsPerDay > 1 && (
          <button
            onClick={() => onDayClick(day)}
            className={`mt-1 w-100% text-[10px] border transition-colors ${
              dayConstraintType === "prefer"
                ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                : dayConstraintType === "avoid"
                ? "bg-red-100 border-red-300 text-red-700 hover:bg-red-200"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
            title="Set preference for all shifts on this day"
          >
            {dayConstraintType
              ? `All shifts: ${dayConstraintType}`
              : "Set all shifts"}
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

          // Check if selected employee is in this specific shift
          const isSelectedInThisShift =
            selectedEmployee && shiftEmployees.includes(selectedEmployee)

          let shiftClass =
            "text-xs border min-h-6 cursor-pointer transition-colors "

          if (selectedEmployee) {
            // Apply shift-specific constraint styling
            if (isSelectedInThisShift) {
              if (shiftConstraint?.type === "prefer") {
                shiftClass +=
                  "bg-green-200 hover:bg-green-300 border-green-400 text-green-800 "
              } else if (shiftConstraint?.type === "avoid") {
                shiftClass +=
                  "bg-red-200 hover:bg-red-300 border-red-400 text-red-800 "
              } else {
                shiftClass +=
                  "bg-blue-100 hover:bg-blue-200 border-blue-400 text-blue-800 "
              }
            } else {
              // Constraint styling when employee is not scheduled
              if (shiftConstraint?.type === "prefer") {
                shiftClass +=
                  "bg-green-50 hover:bg-green-100 border-green-200 text-green-700 "
              } else if (shiftConstraint?.type === "avoid") {
                shiftClass +=
                  "bg-red-50 hover:bg-red-100 border-red-200 text-red-700 "
              } else {
                shiftClass += "hover:bg-blue-25 border-gray-200 "
              }
            }
          } else {
            shiftClass += "border-gray-200 "
          }

          return (
            <div
              key={`${day}-shift-${shiftIndex}`}
              className={shiftClass}
              onClick={() => selectedEmployee && onShiftClick(day, shiftIndex)}
              title={`${shiftLabel} - Click to set preference`}
            >
              <div className="flex justify-between items-center mb-0.5">
                {/* <span className="font-medium text-[10px] text-gray-600">
                  {settings.shiftsPerDay > 1
                    ? shiftLabel.split(" ")[1] || shiftLabel
                    : ""}
                </span> */}
                {shiftConstraint && (
                  <span
                    className={`text-[8px] px-0.5 rounded ${
                      shiftConstraint.type === "prefer"
                        ? "bg-green-300 text-green-900"
                        : "bg-red-300 text-red-900"
                    }`}
                  >
                    {shiftConstraint.type === "prefer" ? "✓" : "✗"}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 grid grid-cols-3">
                {shiftEmployees.map((empId: string) => {
                  const employee = employees.find((emp) => emp.id === empId)
                  const isCurrentSelectedEmployee = selectedEmployee === empId
                  return (
                    <div
                      key={`${empId}-${day}-${shiftIndex}`}
                      className={`text-[10px] truncate ${
                        isCurrentSelectedEmployee ? "font-bold" : ""
                      }`}
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
