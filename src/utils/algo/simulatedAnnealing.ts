import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
  OptimizedScheduleSA,
  getTotalSlotsNeeded,
} from "@/types/schedule"
import { getDaysInMonth, isWeekend } from "../dateUtils"
import simulatedAnnealing from "simulated-annealing"

// Helper function to generate random integer from [0, x)
const randint = (x: number): number => {
  return Math.floor(Math.random() * x)
}

// Conversion functions between Schedule and OptimizedSchedule
const optimizedToSchedule = (
  optimized: OptimizedScheduleSA,
  employees: Employee[],
  settings: ScheduleSettings,
  daysInMonth: number
): Schedule => {
  const totalSlotsNeeded = getTotalSlotsNeeded(daysInMonth, settings)

  // Return null if not enough slots in optimized array
  if (optimized.length < totalSlotsNeeded) {
    throw new Error("Not enough slots in optimized schedule")
  }

  const schedule: Schedule = {}
  let slotIndex = 0

  for (let day = 1; day <= daysInMonth; day++) {
    schedule[day] = { shifts: [] }

    for (let shift = 0; shift < settings.shiftsPerDay; shift++) {
      const shiftEmployees: string[] = []
      const personsThisShift = settings.personsPerShift[shift]

      for (let person = 0; person < personsThisShift; person++) {
        const empIndex = optimized[slotIndex]

        if (empIndex >= 0 && empIndex < employees.length) {
          shiftEmployees.push(employees[empIndex].id)
        } else {
          throw new Error(
            `Invalid employee index ${empIndex} in optimized schedule`
          )
        }
        slotIndex++
      }

      schedule[day].shifts.push({ employeeIds: shiftEmployees })
    }
  }

  return schedule
}

// Generate initial schedule by assigning employees their maximum shifts
const generateInitialSchedule = (
  employees: Employee[]
): OptimizedScheduleSA => {
  const optimized: OptimizedScheduleSA = []

  employees.forEach((emp, empIndex) => {
    for (let i = 0; i < emp.shiftsPerMonth[1]; i++) {
      optimized.push(empIndex)
    }
  })

  // Shuffle
  for (let i = optimized.length - 1; i > 0; i--) {
    const j = randint(i + 1)
    ;[optimized[i], optimized[j]] = [optimized[j], optimized[i]]
  }

  return optimized
}

// Cost function to evaluate optimized schedule quality
const calcCost = (
  optimized: OptimizedScheduleSA,
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  daysInMonth: number,
  selectedMonth: number,
  selectedYear: number
): number => {
  let cost = 0
  const totalSlotsNeeded = getTotalSlotsNeeded(daysInMonth, settings)

  // Penalty weights
  const PENALTY = {
    AVOID_VIOLATION: 2000,
    DUPLICATE_PERSON_IN_SHIFT: 2000,
    CONSECUTIVE: 100,
    WEEKLY_LIMIT: 100,
    UNEVEN_DISTRIBUTION: 50,
    MISSED_PREFERENCE: 100,
    REST_DAYS: 80,
    HOLIDAY_DISTRIBUTION: 1000,
    WEEKEND_CONSECUTIVE: 50,
    TOTAL_SHIFT_COUNT: 2000,
    WEEKEND_SHIFTS_PREFERENCE: 150,
    WEEKDAY_SHIFTS_PREFERENCE: 150,
  } as const

  // Track employee metrics
  const employeeShiftCounts = new Array(employees.length).fill(0)
  const employeeConsecutiveDays = employees.map(() => ({ current: 0, max: 0 }))
  const employeeHolidayShifts = new Array(employees.length).fill(0)
  const employeeWeekdayShifts = new Array(employees.length).fill(0)
  const employeeWeekendConsecutiveDays = employees.map(() => ({
    current: 0,
    max: 0,
  }))

  // Only consider the first totalSlotsNeeded slots
  const activeSlots = optimized.slice(0, totalSlotsNeeded)
  if (activeSlots.length < totalSlotsNeeded) {
    throw new Error(
      `Optimized schedule does not have enough slots: expected ${totalSlotsNeeded}, got ${activeSlots.length}`
    )
  }
  activeSlots.forEach((emp) => {
    if (emp < -1 || emp >= employees.length) {
      throw new Error(`Invalid employee index ${emp} in optimized schedule`)
    }
  })

  // Check each day
  for (let day = 0; day < daysInMonth; day++) {
    const dayNumber = day + 1
    const dayRange = getDaySlotRange(dayNumber, settings)
    const assignedEmployeeIndices = activeSlots.slice(
      dayRange.start,
      dayRange.end
    )

    // Check for duplicate persons in the same shift
    for (let shift = 0; shift < settings.shiftsPerDay; shift++) {
      const shiftRange = getShiftSlotRange(dayNumber, shift, settings)
      const shiftEmployees = activeSlots.slice(shiftRange.start, shiftRange.end)
      const uniqueEmployees = new Set(shiftEmployees)

      // If set length is less than personsPerShift for this shift, there are duplicates
      if (uniqueEmployees.size < settings.personsPerShift[shift]) {
        cost += PENALTY.DUPLICATE_PERSON_IN_SHIFT
      }
    }

    const isWeekendDay = isWeekend(dayNumber, selectedMonth, selectedYear)

    constraints.forEach((constraint) => {
      if (constraint.date === dayNumber) {
        const empIndex = employees.findIndex(
          (emp) => emp.id === constraint.employeeId
        )

        if (empIndex === -1) return // Employee not found

        const shiftRange = getShiftSlotRange(
          dayNumber,
          constraint.shiftIndex,
          settings
        )
        const shiftEmployees = activeSlots.slice(
          shiftRange.start,
          shiftRange.end
        )

        if (constraint.type === "avoid" && shiftEmployees.includes(empIndex)) {
          cost += PENALTY.AVOID_VIOLATION
        }
        if (
          constraint.type === "prefer" &&
          !shiftEmployees.includes(empIndex)
        ) {
          cost += PENALTY.MISSED_PREFERENCE
        }
      }
    })

    // Update employee metrics
    const uniqueAssigned = [...new Set(assignedEmployeeIndices)]
    uniqueAssigned.forEach((empIndex) => {
      employeeShiftCounts[empIndex]++

      // Track holiday vs weekday shifts
      if (isWeekendDay) {
        employeeHolidayShifts[empIndex]++
      } else {
        employeeWeekdayShifts[empIndex]++
      }

      // Check consecutive days
      if (day > 0) {
        // Check if employee worked yesterday
        const yesterdayRange = getDaySlotRange(day, settings) // day is already dayNumber
        let workedYesterday = false

        for (
          let slotIndex = yesterdayRange.start;
          slotIndex < yesterdayRange.end;
          slotIndex++
        ) {
          if (activeSlots[slotIndex] === empIndex) {
            workedYesterday = true
            break
          }
        }

        if (workedYesterday) {
          employeeConsecutiveDays[empIndex].current++
        } else {
          employeeConsecutiveDays[empIndex].current = 1
        }
      } else {
        employeeConsecutiveDays[empIndex].current = 1
      }

      employeeConsecutiveDays[empIndex].max = Math.max(
        employeeConsecutiveDays[empIndex].max,
        employeeConsecutiveDays[empIndex].current
      )

      // Track weekend consecutive days for Weekend type employees
      if (
        isWeekendDay &&
        employees[empIndex]?.tags.includes("tags.weekendType")
      ) {
        if (day > 0) {
          // Check if yesterday was also weekend and employee worked
          const yesterdayNumber = day // day is already dayNumber
          const yesterdayIsWeekend = isWeekend(
            yesterdayNumber,
            selectedMonth,
            selectedYear
          )
          const yesterdayRange = getDaySlotRange(day, settings) // day is already dayNumber
          let workedYesterdayWeekend = false

          if (yesterdayIsWeekend) {
            for (
              let slotIndex = yesterdayRange.start;
              slotIndex < Math.min(yesterdayRange.end, activeSlots.length);
              slotIndex++
            ) {
              if (activeSlots[slotIndex] === empIndex) {
                workedYesterdayWeekend = true
                break
              }
            }
          }

          if (workedYesterdayWeekend) {
            employeeWeekendConsecutiveDays[empIndex].current++
          } else {
            employeeWeekendConsecutiveDays[empIndex].current = 1
          }
        } else {
          employeeWeekendConsecutiveDays[empIndex].current = 1
        }

        employeeWeekendConsecutiveDays[empIndex].max = Math.max(
          employeeWeekendConsecutiveDays[empIndex].max,
          employeeWeekendConsecutiveDays[empIndex].current
        )
      } else {
        // Reset weekend consecutive count for non-weekend days or non-weekend type employees
        employeeWeekendConsecutiveDays[empIndex].current = 0
      }
    })

    // Reset consecutive count for employees not working today
    employees.forEach((emp, index) => {
      if (!uniqueAssigned.includes(index)) {
        employeeConsecutiveDays[index].current = 0
        employeeWeekendConsecutiveDays[index].current = 0
      }
    })
  }

  // Penalty for exceeding consecutive shifts limit
  employees.forEach((emp, index) => {
    let penalty = 0
    if (employeeConsecutiveDays[index].max > settings.maxConsecutiveShifts) {
      const excess =
        employeeConsecutiveDays[index].max - settings.maxConsecutiveShifts
      penalty += excess * PENALTY.CONSECUTIVE
    }
    // Weekend type employees get bonus for consecutive weekend work that can offset consecutive penalties
    if (emp.tags.includes("tags.weekendType")) {
      if (employeeWeekendConsecutiveDays[index].max >= 2) {
        penalty = 0
      } else {
        penalty += PENALTY.WEEKEND_CONSECUTIVE
      }
    }
    cost += penalty
  })

  // Track all work days for each employee across the entire month
  const employeeWorkDaysForRest = employees.map(() => [] as number[])

  // Collect all work days for each employee
  for (let day = 0; day < daysInMonth; day++) {
    const dayRange = getDaySlotRange(day + 1, settings) // Convert to 1-based day

    employees.forEach((emp, empIndex) => {
      let workedThisDay = false

      for (
        let slotIndex = dayRange.start;
        slotIndex < dayRange.end && slotIndex < activeSlots.length;
        slotIndex++
      ) {
        if (activeSlots[slotIndex] === empIndex) {
          workedThisDay = true
          break
        }
      }

      if (workedThisDay) {
        employeeWorkDaysForRest[empIndex].push(day)
      }
    })
  }

  // Check weekly limits and rest days across entire month
  for (let week = 0; week < Math.ceil(daysInMonth / 7); week++) {
    const weekStart = week * 7
    const weekEnd = Math.min(weekStart + 6, daysInMonth - 1)

    employees.forEach((emp, empIndex) => {
      let weeklyShifts = 0

      // Count shifts for this week only
      for (let day = weekStart; day <= weekEnd; day++) {
        if (employeeWorkDaysForRest[empIndex].includes(day)) {
          weeklyShifts++
        }
      }

      // Weekly limits penalty
      if (weeklyShifts > settings.maxShiftsPerWeek) {
        cost +=
          (weeklyShifts - settings.maxShiftsPerWeek) * PENALTY.WEEKLY_LIMIT
      }
    })
  }

  // Rest days penalty - check across entire month for each employee
  employees.forEach((emp, empIndex) => {
    const workDays = employeeWorkDaysForRest[empIndex].sort((a, b) => a - b)

    for (let i = 0; i < workDays.length - 1; i++) {
      const daysBetween = workDays[i + 1] - workDays[i] - 1
      if (daysBetween < settings.minRestDaysBetweenShifts) {
        cost +=
          (settings.minRestDaysBetweenShifts - daysBetween) * PENALTY.REST_DAYS
      }
    }
  })

  // Min/Max shifts per employee penalty
  employees.forEach((employee, empIndex) => {
    const shiftsAssigned = employeeShiftCounts[empIndex]

    // Penalize if below minimum
    if (shiftsAssigned < employee.shiftsPerMonth[0]) {
      cost +=
        (employee.shiftsPerMonth[0] - shiftsAssigned) *
        PENALTY.TOTAL_SHIFT_COUNT
    }

    // Penalize if above maximum
    if (shiftsAssigned > employee.shiftsPerMonth[1]) {
      cost +=
        (shiftsAssigned - employee.shiftsPerMonth[1]) *
        PENALTY.TOTAL_SHIFT_COUNT
    }

    // Weekend/Weekday shift preference penalty
    const weekendShiftsAssigned = employeeHolidayShifts[empIndex]
    const weekdayShiftsAssigned = employeeWeekdayShifts[empIndex]

    // Penalize if weekend shifts are below minimum preference
    if (weekendShiftsAssigned < employee.weekendShifts[0]) {
      cost +=
        (employee.weekendShifts[0] - weekendShiftsAssigned) *
        PENALTY.WEEKEND_SHIFTS_PREFERENCE
    }

    // Penalize if weekend shifts are above maximum preference
    if (weekendShiftsAssigned > employee.weekendShifts[1]) {
      cost +=
        (weekendShiftsAssigned - employee.weekendShifts[1]) *
        PENALTY.WEEKEND_SHIFTS_PREFERENCE
    }

    // Penalize if weekday shifts are below minimum preference
    if (weekdayShiftsAssigned < employee.weekdayShifts[0]) {
      cost +=
        (employee.weekdayShifts[0] - weekdayShiftsAssigned) *
        PENALTY.WEEKDAY_SHIFTS_PREFERENCE
    }

    // Penalize if weekday shifts are above maximum preference
    if (weekdayShiftsAssigned > employee.weekdayShifts[1]) {
      cost +=
        (weekdayShiftsAssigned - employee.weekdayShifts[1]) *
        PENALTY.WEEKDAY_SHIFTS_PREFERENCE
    }
  })

  // Even distribution penalty
  if (settings.evenDistribution) {
    const avgShifts =
      employeeShiftCounts.reduce((sum, count) => sum + count, 0) /
      employeeShiftCounts.length
    const variance =
      employeeShiftCounts.reduce(
        (sum, count) => sum + Math.pow(count - avgShifts, 2),
        0
      ) / employeeShiftCounts.length
    cost += variance * PENALTY.UNEVEN_DISTRIBUTION
  }

  const totalHolidayShifts = employeeHolidayShifts.reduce(
    (sum, count) => sum + count,
    0
  )
  const totalWeekdayShifts = employeeWeekdayShifts.reduce(
    (sum, count) => sum + count,
    0
  )

  if (totalHolidayShifts > 0 && totalWeekdayShifts > 0) {
    employees.forEach((_, empIndex) => {
      const employeeTotalShifts = employeeShiftCounts[empIndex]
      if (employeeTotalShifts > 0) {
        const holidayRatio =
          employeeHolidayShifts[empIndex] / employeeTotalShifts
        const globalHolidayRatio =
          totalHolidayShifts / (totalHolidayShifts + totalWeekdayShifts)

        const holidayRatioDeviation = Math.abs(
          holidayRatio - globalHolidayRatio
        )

        // 特别惩罚只值假日班或只值平日班的员工
        if (
          employeeHolidayShifts[empIndex] > 0 &&
          employeeWeekdayShifts[empIndex] === 0 &&
          employeeTotalShifts > 1
        ) {
          cost += PENALTY.HOLIDAY_DISTRIBUTION * 2
        } else if (
          employeeWeekdayShifts[empIndex] > 0 &&
          employeeHolidayShifts[empIndex] === 0 &&
          employeeTotalShifts > 1
        ) {
          cost += PENALTY.HOLIDAY_DISTRIBUTION
        } else if (holidayRatioDeviation > 0.3) {
          cost += holidayRatioDeviation * PENALTY.HOLIDAY_DISTRIBUTION
        }
      }
    })
  }
  console.log(`Cost calculated: ${cost}`)

  return cost
}

// Helper function for calculating day slot range with variable personsPerShift
const getDaySlotRange = (day: number, settings: ScheduleSettings) => {
  const totalPersonsPerDay = settings.personsPerShift.reduce(
    (sum, persons) => sum + persons,
    0
  )
  const dayStartSlot = (day - 1) * totalPersonsPerDay
  const dayEndSlot = day * totalPersonsPerDay
  return { start: dayStartSlot, end: dayEndSlot }
}

// Helper function for calculating shift slot range within a day
const getShiftSlotRange = (
  day: number,
  shiftIndex: number,
  settings: ScheduleSettings
) => {
  const dayRange = getDaySlotRange(day, settings)
  let shiftStart = dayRange.start

  for (let i = 0; i < shiftIndex; i++) {
    shiftStart += settings.personsPerShift[i]
  }

  return {
    start: shiftStart,
    end: shiftStart + settings.personsPerShift[shiftIndex],
  }
}

// Generate a neighbor solution by making permutations of the optimized schedule
const generateNeighbor = (
  currentOptimized: OptimizedScheduleSA
): OptimizedScheduleSA => {
  const newOptimized = [...currentOptimized]

  if (newOptimized.length < 2) return newOptimized

  const operations = ["swap", "move", "reverse", "transport"]
  const operation = operations[randint(operations.length)]
  const i = randint(newOptimized.length)
  const j = randint(newOptimized.length)

  switch (operation) {
    case "swap": {
      ;[newOptimized[i], newOptimized[j]] = [newOptimized[j], newOptimized[i]]
      break
    }

    case "move": {
      const element = newOptimized.splice(i, 1)[0]
      newOptimized.splice(j, 0, element)
      break
    }

    case "reverse": {
      let left = Math.min(i, j)
      let right = Math.max(i, j)
      while (left < right) {
        ;[newOptimized[left], newOptimized[right]] = [
          newOptimized[right],
          newOptimized[left],
        ]
        left++
        right--
      }
      break
    }

    case "transport": {
      if (newOptimized.length < 3) break // Need at least 3 elements for meaningful transport

      const start = Math.min(i, j)
      const end = Math.max(i, j)

      if (start < end) {
        // Extract the segment [start, end]
        const segment = newOptimized.splice(start, end - start + 1)

        // Choose insertion position k (excluding the original range)
        const k = randint(newOptimized.length)

        // Insert the segment at position k
        newOptimized.splice(k, 0, ...segment)
      }
      break
    }
  }

  return newOptimized
}

export const generateSchedule = (
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  selectedMonth: number,
  selectedYear: number
): { schedule: Schedule; success: boolean; message: string } => {
  if (employees.length === 0) {
    return {
      schedule: {},
      success: false,
      message: "Please add employees before generating a schedule.",
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)

  // Generate initial optimized solution
  const initialOptimized = generateInitialSchedule(employees)

  // Configure simulated annealing with optimized schedule
  const tempMax = 1000
  const tempMin = 0.1
  const coolingRate = 0.999

  // Temperature function
  const getTemp = (previousTemp: number) => previousTemp * coolingRate

  // Energy function using optimized schedule
  const getEnergy = (optimized: OptimizedScheduleSA) =>
    calcCost(
      optimized,
      employees,
      constraints,
      settings,
      daysInMonth,
      selectedMonth,
      selectedYear
    )

  // New state function using optimized schedule
  const newState = (currentState: OptimizedScheduleSA) =>
    generateNeighbor(currentState)

  try {
    // Run simulated annealing with optimized schedule
    console.log(
      `Starting optimized simulated annealing with ${employees.length} employees, ${daysInMonth} days`
    )
    const startTime = Date.now()

    const result = simulatedAnnealing({
      initialState: initialOptimized,
      tempMax: tempMax,
      tempMin: tempMin,
      newState: newState,
      getTemp: getTemp,
      getEnergy: getEnergy,
    })

    const endTime = Date.now()
    console.log(`Simulated annealing completed in ${endTime - startTime}ms`)

    // Convert back to the original Schedule format
    const finalSchedule = optimizedToSchedule(
      result,
      employees,
      settings,
      daysInMonth
    )

    // Verify the solution using the optimized cost function
    const finalCost = calcCost(
      result,
      employees,
      constraints,
      settings,
      daysInMonth,
      selectedMonth,
      selectedYear
    )

    const message =
      finalCost === 0
        ? "Perfect schedule generated with all constraints satisfied!"
        : `Schedule generated with optimization score: ${Math.round(
            Math.max(0, finalCost)
          )}`

    return {
      schedule: finalSchedule,
      success: true,
      message,
    }
  } catch (error) {
    console.error("Simulated annealing failed:", error)

    return {
      schedule: {},
      success: false,
      message: "Simulated annealing failed.",
    }
  }
}
