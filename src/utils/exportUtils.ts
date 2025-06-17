import { Employee, Schedule } from "@/types/schedule"
import { getDaysInMonth, getMonthName } from "./dateUtils"

export const exportScheduleAsCSV = (
  schedule: Schedule,
  employees: Employee[],
  selectedMonth: number,
  selectedYear: number,
  t: (key: string) => string
): void => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  let csvContent = "Date,Employee\n"

  for (let day = 1; day <= daysInMonth; day++) {
    const assignedEmployees = schedule[day] || []
    if (assignedEmployees.length > 0) {
      assignedEmployees.forEach((empId) => {
        const employee = employees.find((emp) => emp.id === empId)
        csvContent += `${selectedYear}-${(selectedMonth + 1)
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")},${
          employee?.name || "Unknown"
        }\n`
      })
    } else {
      csvContent += `${selectedYear}-${(selectedMonth + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")},No Assignment\n`
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
  t: (key: string) => string
): void => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
  const cellWidth = 120
  const cellHeight = 40
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

    // Draw assigned employee
    const assignedEmployees = schedule[day] || []
    if (assignedEmployees.length > 0) {
      const employee = employees.find((emp) => emp.id === assignedEmployees[0])
      ctx.fillStyle = "#0066cc"
      ctx.fillText(employee?.name || "Unknown", x + 5, y + 35)
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
