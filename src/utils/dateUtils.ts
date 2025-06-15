export const getDaysInMonth = (month: number, year: number): number => {
  if (!month || !year) return 0
  return new Date(year, month, 0).getDate()
}

export const getMonthName = (month: number): string => {
  if (!month) return ""
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return monthNames[month - 1] || ""
}

export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month - 1, 1).getDay()
}

export const isWeekend = (
  day: number,
  month: number,
  year: number
): boolean => {
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

export const getCurrentMonthYear = () => {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}
