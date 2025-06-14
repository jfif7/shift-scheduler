export const getDaysInMonth = (month: string, year: string): number => {
  if (!month || !year) return 0
  return new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()
}

export const getMonthName = (month: string): string => {
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
  return monthNames[Number.parseInt(month) - 1]
}

export const getFirstDayOfMonth = (month: string, year: string): number => {
  return new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1).getDay()
}

export const isWeekend = (
  day: number,
  month: string,
  year: string
): boolean => {
  const dayOfWeek = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    day
  ).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

export const getCurrentMonthYear = () => {
  const now = new Date()
  return {
    month: (now.getMonth() + 1).toString(),
    year: now.getFullYear().toString(),
  }
}
