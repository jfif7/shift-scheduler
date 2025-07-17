import { Employee, Schedule, ScheduleSettings } from "@/types/schedule"
import { getDaysInMonth, getMonthName } from "./dateUtils"

export const exportScheduleAsCSV = (
  schedule: Schedule,
  employees: Employee[],
  selectedMonth: number,
  selectedYear: number,
  t: (key: string) => string,
  settings?: ScheduleSettings
): void => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  let csvContent = "Date,Shift,Employee\n"

  for (let day = 1; day <= daysInMonth; day++) {
    const daySchedule = schedule[day]
    const dateStr = `${selectedYear}-${(selectedMonth + 1)
      .toString()
      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`

    if (daySchedule?.shifts && daySchedule.shifts.length > 0) {
      // Export with shift-specific information
      daySchedule.shifts.forEach((shift, shiftIndex) => {
        const shiftLabel = settings?.shiftLabels?.[shiftIndex] || `Shift ${shiftIndex + 1}`
        
        if (shift.employeeIds.length > 0) {
          shift.employeeIds.forEach((empId) => {
            const employee = employees.find((emp) => emp.id === empId)
            csvContent += `${dateStr},${shiftLabel},${employee?.name || "Unknown"}\n`
          })
        } else {
          csvContent += `${dateStr},${shiftLabel},No Assignment\n`
        }
      })
    } else {
      // Fallback for days with no schedule
      csvContent += `${dateStr},No Shifts,No Assignment\n`
    }
  }

  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `schedule-${getMonthName(selectedMonth, t)}-${selectedYear}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}

export const exportScheduleAsImage = (
  schedule: Schedule,
  employees: Employee[],
  selectedMonth: number,
  selectedYear: number,
  t: (key: string) => string,
  settings?: ScheduleSettings
): void => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const cellWidth = 140 // Increased width for shift information
  const cellHeight = settings?.shiftsPerDay && settings.shiftsPerDay > 1 ? 60 : 40 // Taller cells for multiple shifts
  const headerHeight = 60

  canvas.width = Math.max(800, cellWidth * 7)
  canvas.height = headerHeight + Math.ceil(daysInMonth / 7) * cellHeight

  // Set background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw title
  ctx.fillStyle = "#000000"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "center"
  ctx.fillText(
    `${getMonthName(selectedMonth, t)} ${selectedYear} Schedule`,
    canvas.width / 2,
    30
  )

  // Draw calendar grid
  ctx.font = "14px Arial"
  ctx.textAlign = "left"

  for (let day = 1; day <= daysInMonth; day++) {
    const row = Math.floor((day - 1) / 7)
    const col = (day - 1) % 7
    const x = col * cellWidth
    const y = headerHeight + row * cellHeight

    // Draw cell border
    ctx.strokeStyle = "#cccccc"
    ctx.strokeRect(x, y, cellWidth, cellHeight)

    // Draw day number
    ctx.fillStyle = "#000000"
    ctx.fillText(day.toString(), x + 5, y + 20)

    // Draw shift assignments
    const daySchedule = schedule[day]
    if (daySchedule?.shifts && daySchedule.shifts.length > 0) {
      let yOffset = 35
      
      daySchedule.shifts.forEach((shift, shiftIndex) => {
        if (shift.employeeIds.length > 0) {
          // Show shift label if multiple shifts
          if (settings?.shiftsPerDay && settings.shiftsPerDay > 1) {
            const shiftLabel = settings.shiftLabels?.[shiftIndex] || `S${shiftIndex + 1}`
            ctx.fillStyle = "#666666"
            ctx.font = "10px Arial"
            ctx.fillText(`${shiftLabel}:`, x + 5, yOffset)
            yOffset += 12
          }
          
          // Show employees (limit to first 2 to fit in cell)
          const displayEmployees = shift.employeeIds.slice(0, 2)
          displayEmployees.forEach((empId) => {
            const employee = employees.find((emp) => emp.id === empId)
            ctx.fillStyle = "#0066cc"
            ctx.font = "10px Arial"
            const name = employee?.name || "Unknown"
            const truncatedName = name.length > 12 ? name.substring(0, 10) + "..." : name
            ctx.fillText(truncatedName, x + 5, yOffset)
            yOffset += 10
          })
          
          // Show count if more employees
          if (shift.employeeIds.length > 2) {
            ctx.fillStyle = "#888888"
            ctx.font = "8px Arial"
            ctx.fillText(`+${shift.employeeIds.length - 2} more`, x + 5, yOffset)
            yOffset += 10
          }
        }
      })
    }
  }

  // Convert to blob and download
  canvas.toBlob((blob) => {
    if (blob) {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `schedule-${getMonthName(
        selectedMonth,
        t
      )}-${selectedYear}.png`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  })
}
