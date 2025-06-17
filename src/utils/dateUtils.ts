export const getDaysInMonth = (month: number, year: number): number => {
  if (month < 0 || month > 11 || !year) return 0
  return new Date(year, month + 1, 0).getDate()
}

export const getMonthName = (
  month: number,
  t: (key: string) => string
): string => {
  if (month < 0 || month > 11) return ""
  return t(`months.${month}`) || ""
}

export const getFirstDayOfMonth = (month: number, year: number): number => {
  return new Date(year, month, 1).getDay()
}

export const isWeekend = (
  day: number,
  month: number,
  year: number
): boolean => {
  const dayOfWeek = new Date(year, month, day).getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
}

export const getCurrentMonthYear = () => {
  const now = new Date()
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  }
}
