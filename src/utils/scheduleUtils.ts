import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
  OptimizedSchedule,
} from "@/types/schedule"
import { getDaysInMonth, isWeekend } from "./dateUtils"
import simulatedAnnealing from "simulated-annealing"

// Helper function to generate random integer from [0, x)
const randint = (x: number): number => {
  return Math.floor(Math.random() * x)
}

// Conversion functions between Schedule and OptimizedSchedule
const optimizedToSchedule = (
  optimized: OptimizedSchedule,
  employees: Employee[],
  settings: ScheduleSettings,
  daysInMonth: number
): Schedule => {
  const { shiftsPerDay, personsPerShift } = settings
  const totalSlotsNeeded = daysInMonth * shiftsPerDay * personsPerShift

  // Return null if not enough slots in optimized array
  if (optimized.length < totalSlotsNeeded) {
    throw new Error("Not enough slots in optimized schedule")
  }

  const schedule: Schedule = {}
  let slotIndex = 0

  for (let day = 1; day <= daysInMonth; day++) {
    schedule[day] = []
    for (let shift = 0; shift < shiftsPerDay; shift++) {
      for (let person = 0; person < personsPerShift; person++) {
        const empIndex = optimized[slotIndex]

        if (empIndex >= 0 && empIndex < employees.length) {
          schedule[day].push(employees[empIndex].id)
          slotIndex++
        } else {
          throw new Error(
            `Invalid employee index ${empIndex} in optimized schedule`
          )
        }
      }
    }
  }

  return schedule
}

// Generate initial schedule by assigning employees their maximum shifts
const generateInitialSchedule = (employees: Employee[]): OptimizedSchedule => {
  const optimized: OptimizedSchedule = []

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
  optimized: OptimizedSchedule,
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  daysInMonth: number,
  selectedMonth: number,
  selectedYear: number
): number => {
  let cost = 0
  const { shiftsPerDay, personsPerShift } = settings
  const totalSlotsNeeded = daysInMonth * shiftsPerDay * personsPerShift

  // Penalty weights
  const AVOID_VIOLATION_PENALTY = 1000
  const DUPLICATE_PERSON_IN_SHIFT_PENALTY = 2000
  const CONSECUTIVE_PENALTY = 100
  const WEEKLY_LIMIT_PENALTY = 100
  const UNEVEN_DISTRIBUTION_PENALTY = 50
  const MISSED_PREFERENCE_PENALTY = 10
  const REST_DAYS_PENALTY = 80
  const HOLIDAY_DISTRIBUTION_PENALTY = 1000
  const WEEKEND_CONSECUTIVE_PENALTY = 50

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

    // Get all assigned employees for this day
    const dayStartSlot = day * shiftsPerDay * personsPerShift
    const dayEndSlot = dayStartSlot + shiftsPerDay * personsPerShift

    const assignedEmployeeIndices = activeSlots.slice(dayStartSlot, dayEndSlot)

    // Check for duplicate persons in the same shift
    for (let shift = 0; shift < shiftsPerDay; shift++) {
      const shiftStartSlot = dayStartSlot + shift * personsPerShift
      const shiftEndSlot = shiftStartSlot + personsPerShift

      const uniqueEmployees = new Set(
        activeSlots.slice(shiftStartSlot, shiftEndSlot)
      )

      // If set length is less than personsPerShift, there are duplicates
      if (uniqueEmployees.size < personsPerShift) {
        cost += DUPLICATE_PERSON_IN_SHIFT_PENALTY
      }
    }

    const isWeekendDay = isWeekend(dayNumber, selectedMonth, selectedYear)

    // Check constraints
    constraints.forEach((constraint) => {
      if (constraint.type === "avoid" && constraint.date === dayNumber) {
        const empIndex = employees.findIndex(
          (emp) => emp.id === constraint.employeeId
        )
        if (empIndex !== -1 && assignedEmployeeIndices.includes(empIndex)) {
          cost += AVOID_VIOLATION_PENALTY
        }
      }
      if (constraint.type === "prefer" && constraint.date === dayNumber) {
        const empIndex = employees.findIndex(
          (emp) => emp.id === constraint.employeeId
        )
        if (empIndex !== -1 && !assignedEmployeeIndices.includes(empIndex)) {
          cost += MISSED_PREFERENCE_PENALTY
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
        const yesterdayStartSlot = (day - 1) * shiftsPerDay * personsPerShift
        const yesterdayEndSlot = day * shiftsPerDay * personsPerShift
        let workedYesterday = false

        for (
          let slotIndex = yesterdayStartSlot;
          slotIndex < yesterdayEndSlot;
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
          const yesterdayNumber = day
          const yesterdayIsWeekend = isWeekend(
            yesterdayNumber,
            selectedMonth,
            selectedYear
          )
          const yesterdayStartSlot = (day - 1) * shiftsPerDay * personsPerShift
          const yesterdayEndSlot = day * shiftsPerDay * personsPerShift
          let workedYesterdayWeekend = false

          if (yesterdayIsWeekend) {
            for (
              let slotIndex = yesterdayStartSlot;
              slotIndex < Math.min(yesterdayEndSlot, activeSlots.length);
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
      penalty += excess * CONSECUTIVE_PENALTY
    }
    // Weekend type employees get bonus for consecutive weekend work that can offset consecutive penalties
    if (emp.tags.includes("tags.weekendType")) {
      if (employeeWeekendConsecutiveDays[index].max >= 2) {
        penalty = 0
      } else {
        penalty += WEEKEND_CONSECUTIVE_PENALTY
      }
    }
    cost += penalty
  })

  // Check weekly limits and rest days
  for (let week = 0; week < Math.ceil(daysInMonth / 7); week++) {
    const weekStart = week * 7
    const weekEnd = Math.min(weekStart + 6, daysInMonth - 1)

    employees.forEach((emp, empIndex) => {
      let weeklyShifts = 0
      const workDays: number[] = []

      for (let day = weekStart; day <= weekEnd; day++) {
        const dayStartSlot = day * shiftsPerDay * personsPerShift
        const dayEndSlot = Math.min(
          (day + 1) * shiftsPerDay * personsPerShift,
          activeSlots.length
        )
        let workedThisDay = false

        for (
          let slotIndex = dayStartSlot;
          slotIndex < dayEndSlot;
          slotIndex++
        ) {
          if (activeSlots[slotIndex] === empIndex) {
            workedThisDay = true
            break
          }
        }

        if (workedThisDay) {
          weeklyShifts++
          workDays.push(day)
        }
      }

      // Weekly limits penalty
      if (weeklyShifts > settings.maxShiftsPerWeek) {
        cost +=
          (weeklyShifts - settings.maxShiftsPerWeek) * WEEKLY_LIMIT_PENALTY
      }

      // Rest days penalty
      for (let i = 0; i < workDays.length - 1; i++) {
        const daysBetween = workDays[i + 1] - workDays[i] - 1
        if (daysBetween < settings.minRestDaysBetweenShifts) {
          cost +=
            (settings.minRestDaysBetweenShifts - daysBetween) *
            REST_DAYS_PENALTY
        }
      }
    })
  }

  // Min/Max shifts per employee penalty
  const MIN_SHIFTS_PENALTY = 200
  const MAX_SHIFTS_PENALTY = 200

  employees.forEach((employee, empIndex) => {
    const shiftsAssigned = employeeShiftCounts[empIndex]

    // Penalize if below minimum
    if (shiftsAssigned < employee.shiftsPerMonth[0]) {
      cost += (employee.shiftsPerMonth[0] - shiftsAssigned) * MIN_SHIFTS_PENALTY
    }

    // Penalize if above maximum
    if (shiftsAssigned > employee.shiftsPerMonth[1]) {
      cost += (shiftsAssigned - employee.shiftsPerMonth[1]) * MAX_SHIFTS_PENALTY
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
    cost += variance * UNEVEN_DISTRIBUTION_PENALTY
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
          cost += HOLIDAY_DISTRIBUTION_PENALTY * 2
        } else if (
          employeeWeekdayShifts[empIndex] > 0 &&
          employeeHolidayShifts[empIndex] === 0 &&
          employeeTotalShifts > 1
        ) {
          cost += HOLIDAY_DISTRIBUTION_PENALTY
        } else if (holidayRatioDeviation > 0.3) {
          cost += holidayRatioDeviation * HOLIDAY_DISTRIBUTION_PENALTY
        }
      }
    })
  }
  console.log(`Cost calculated: ${cost}`)

  return cost
}

// Generate a neighbor solution by making permutations of the optimized schedule
const generateOptimizedNeighbor = (
  currentOptimized: OptimizedSchedule
): OptimizedSchedule => {
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

  // Calculate total shifts needed and available
  const totalShiftsNeeded =
    daysInMonth * settings.shiftsPerDay * settings.personsPerShift
  const totalMinShifts = employees.reduce(
    (sum, emp) => sum + emp.shiftsPerMonth[0],
    0
  )
  const totalMaxShifts = employees.reduce(
    (sum, emp) => sum + emp.shiftsPerMonth[1],
    0
  )

  if (totalMaxShifts < totalShiftsNeeded) {
    return {
      schedule: {},
      success: false,
      message: `Not enough maximum shifts available (${totalMaxShifts}) to cover all required shifts (${totalShiftsNeeded})`,
    }
  }

  if (totalMinShifts > totalShiftsNeeded) {
    return {
      schedule: {},
      success: false,
      message: `Minimum shifts required (${totalMinShifts}) exceed total shifts needed (${totalShiftsNeeded})`,
    }
  }

  // Generate initial optimized solution
  const initialOptimized = generateInitialSchedule(employees)

  // Configure simulated annealing with optimized schedule
  const tempMax = 1000
  const tempMin = 0.1
  const coolingRate = 0.99

  // Temperature function
  const getTemp = (previousTemp: number) => previousTemp * coolingRate

  // Energy function using optimized schedule
  const getEnergy = (optimized: OptimizedSchedule) =>
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
  const newState = (currentState: OptimizedSchedule) =>
    generateOptimizedNeighbor(currentState)

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
