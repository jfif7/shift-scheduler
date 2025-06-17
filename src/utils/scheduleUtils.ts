import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
  OptimizedSchedule,
} from "@/types/schedule"
import { getDaysInMonth, isWeekend } from "./dateUtils"
import simulatedAnnealing from "simulated-annealing"

/*
 * OPTIMIZED SIMULATED ANNEALING APPROACH
 *
 * This implementation uses a simplified OptimizedSchedule representation to speed up
 * the simulated annealing process:
 *
 * 1. OptimizedSchedule is a simple array of employee indices (no -1 values, no complex mapping)
 * 2. Length can exceed the actual slots needed - only first N slots are used for scheduling
 * 3. Initial generation: assign each employee their maximum shifts, then shuffle
 * 4. Neighbor generation: simple permutations (swap, move, shuffle sections)
 * 5. Cost calculation: only considers first totalSlotsNeeded elements
 * 6. Final conversion: maps back to original Schedule format only at the end
 *
 * Benefits:
 * - Much faster array operations (no object lookups, no string comparisons)
 * - Simpler neighbor generation (pure permutations vs complex constraint checking)
 * - Better memory efficiency during optimization
 * - Allows natural selection to handle optimization vs manual constraint enforcement
 */

// Conversion functions between Schedule and OptimizedSchedule
const optimizedToSchedule = (
  optimized: OptimizedSchedule,
  employees: Employee[],
  settings: ScheduleSettings,
  daysInMonth: number
): Schedule | null => {
  const { shiftsPerDay, personsPerShift } = settings
  const totalSlotsNeeded = daysInMonth * shiftsPerDay * personsPerShift

  // Return null if not enough slots in optimized array
  if (optimized.length < totalSlotsNeeded) {
    return null
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

// Simply assign everyone their maximum shifts
const generateInitialSchedule = (employees: Employee[]): OptimizedSchedule => {
  const optimized: OptimizedSchedule = []

  employees.forEach((emp, empIndex) => {
    for (let i = 0; i < emp.shiftsPerMonth; i++) {
      optimized.push(empIndex)
    }
  })

  // Shuffle
  for (let i = optimized.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
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
  const UNFILLED_SHIFT_PENALTY = 1000
  const CONSECUTIVE_PENALTY = 100
  const WEEKLY_LIMIT_PENALTY = 100
  const UNEVEN_DISTRIBUTION_PENALTY = 50
  const MISSED_PREFERENCE_PENALTY = 10
  const WEEKEND_COVERAGE_PENALTY = 20
  const REST_DAYS_PENALTY = 80

  // Track employee metrics
  const employeeShiftCounts = new Array(employees.length).fill(0)
  const employeeConsecutiveDays = employees.map(() => ({ current: 0, max: 0 }))

  // Only consider the first totalSlotsNeeded slots
  const activeSlots = optimized.slice(0, totalSlotsNeeded)

  // Check each day
  for (let day = 0; day < daysInMonth; day++) {
    const dayNumber = day + 1
    const assignedEmployeeIndices: number[] = []

    // Get all assigned employees for this day
    const dayStartSlot = day * shiftsPerDay * personsPerShift
    const dayEndSlot = Math.min(
      (day + 1) * shiftsPerDay * personsPerShift,
      activeSlots.length
    )

    for (let slotIndex = dayStartSlot; slotIndex < dayEndSlot; slotIndex++) {
      const empIndex = activeSlots[slotIndex]
      if (empIndex >= 0 && empIndex < employees.length) {
        assignedEmployeeIndices.push(empIndex)
      }
    }

    const shiftsNeeded = shiftsPerDay * personsPerShift
    const isWeekendDay = isWeekend(dayNumber, selectedMonth, selectedYear)

    // Penalty for unfilled shifts
    if (assignedEmployeeIndices.length < shiftsNeeded) {
      cost +=
        (shiftsNeeded - assignedEmployeeIndices.length) * UNFILLED_SHIFT_PENALTY
    }

    // Check avoid constraints
    constraints.forEach((constraint) => {
      if (constraint.type === "avoid" && constraint.date === dayNumber) {
        const empIndex = employees.findIndex(
          (emp) => emp.id === constraint.employeeId
        )
        if (empIndex !== -1 && assignedEmployeeIndices.includes(empIndex)) {
          cost += AVOID_VIOLATION_PENALTY
        }
      }
    })

    // Check prefer constraints (penalty for missing them)
    constraints.forEach((constraint) => {
      if (constraint.type === "prefer" && constraint.date === dayNumber) {
        const empIndex = employees.findIndex(
          (emp) => emp.id === constraint.employeeId
        )
        if (empIndex !== -1 && !assignedEmployeeIndices.includes(empIndex)) {
          cost += MISSED_PREFERENCE_PENALTY
        }
      }
    })

    // Weekend coverage penalty
    if (isWeekendDay && settings.weekendCoverageRequired) {
      const weekendWorkers = assignedEmployeeIndices.filter((empIndex) => {
        return employees[empIndex]?.tags.includes("Weekend type")
      })
      if (weekendWorkers.length === 0 && assignedEmployeeIndices.length > 0) {
        cost += WEEKEND_COVERAGE_PENALTY
      }
    }

    // Update employee metrics
    const uniqueAssigned = [...new Set(assignedEmployeeIndices)]
    uniqueAssigned.forEach((empIndex) => {
      employeeShiftCounts[empIndex]++

      // Check consecutive days
      if (day > 0) {
        // Check if employee worked yesterday
        const yesterdayStartSlot = (day - 1) * shiftsPerDay * personsPerShift
        const yesterdayEndSlot = day * shiftsPerDay * personsPerShift
        let workedYesterday = false

        for (
          let slotIndex = yesterdayStartSlot;
          slotIndex < Math.min(yesterdayEndSlot, activeSlots.length);
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
    })

    // Reset consecutive count for employees not working today
    employees.forEach((emp, index) => {
      if (!uniqueAssigned.includes(index)) {
        employeeConsecutiveDays[index].current = 0
      }
    })
  }

  // Penalty for exceeding consecutive shifts limit
  employees.forEach((emp, index) => {
    if (employeeConsecutiveDays[index].max > settings.maxConsecutiveShifts) {
      const excess =
        employeeConsecutiveDays[index].max - settings.maxConsecutiveShifts
      cost += excess * CONSECUTIVE_PENALTY
    }
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

  // Penalty for employees exceeding their monthly shift limit (from active slots only)
  employees.forEach((emp, index) => {
    if (employeeShiftCounts[index] > emp.shiftsPerMonth) {
      const excess = employeeShiftCounts[index] - emp.shiftsPerMonth
      cost += excess * UNFILLED_SHIFT_PENALTY
    }
  })

  return cost
}

// Generate a neighbor solution by making permutations of the optimized schedule
const generateOptimizedNeighbor = (
  currentOptimized: OptimizedSchedule
): OptimizedSchedule => {
  const newOptimized = [...currentOptimized]

  if (newOptimized.length < 2) return newOptimized

  const operations = ["swap", "move", "shuffle_section"]
  const operation = operations[Math.floor(Math.random() * operations.length)]

  switch (operation) {
    case "swap": {
      // Swap two random positions
      const pos1 = Math.floor(Math.random() * newOptimized.length)
      const pos2 = Math.floor(Math.random() * newOptimized.length)

      if (pos1 !== pos2) {
        ;[newOptimized[pos1], newOptimized[pos2]] = [
          newOptimized[pos2],
          newOptimized[pos1],
        ]
      }
      break
    }

    case "move": {
      // Move an element from one position to another
      const fromPos = Math.floor(Math.random() * newOptimized.length)
      const toPos = Math.floor(Math.random() * newOptimized.length)

      if (fromPos !== toPos) {
        const element = newOptimized.splice(fromPos, 1)[0]
        newOptimized.splice(toPos, 0, element)
      }
      break
    }

    case "shuffle_section": {
      // Shuffle a small section of the array
      const sectionSize = Math.min(5, Math.floor(newOptimized.length / 4))
      const startPos = Math.floor(
        Math.random() * (newOptimized.length - sectionSize)
      )

      // Extract section, shuffle it, and put it back
      const section = newOptimized.slice(startPos, startPos + sectionSize)
      for (let i = section.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[section[i], section[j]] = [section[j], section[i]]
      }

      // Replace the section
      newOptimized.splice(startPos, sectionSize, ...section)
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
): { schedule: Schedule | null; success: boolean; message: string } => {
  if (employees.length === 0) {
    return {
      schedule: null,
      success: false,
      message: "Please add employees before generating a schedule.",
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)

  // Calculate total shifts needed and available
  const totalShiftsNeeded =
    daysInMonth * settings.shiftsPerDay * settings.personsPerShift
  const totalShiftsAvailable = employees.reduce(
    (sum, emp) => sum + emp.shiftsPerMonth,
    0
  )

  if (totalShiftsAvailable < totalShiftsNeeded) {
    return {
      schedule: null,
      success: false,
      message: `Need ${totalShiftsNeeded} total shifts, but only ${totalShiftsAvailable} available.`,
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
            Math.max(0, 1000 - finalCost)
          )}/1000`

    return {
      schedule: finalSchedule,
      success: true,
      message,
    }
  } catch (error) {
    console.error("Simulated annealing failed:", error)

    return {
      schedule: null,
      success: false,
      message: "Simulated annealing failed.",
    }
  }
}
