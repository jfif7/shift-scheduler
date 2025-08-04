import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
  OptimizedScheduleGenetic,
} from "@/types/schedule"
import { getDaysInMonth, isWeekend } from "../dateUtils"
import { GeneticConfig } from "@/lib/genetic"
import genetic from "@/lib/genetic"

// Helper function to generate random integer from [0, x)
const randint = (x: number): number => {
  return Math.floor(Math.random() * x)
}

// Conversion functions between Schedule and OptimizedSchedule
const optimizedToSchedule = (
  geneticSchedule: OptimizedScheduleGenetic,
  employees: Employee[],
  settings: ScheduleSettings,
  daysInMonth: number
): Schedule => {
  if (!geneticSchedule || !Array.isArray(geneticSchedule)) {
    throw new Error("Invalid genetic schedule provided to optimizedToSchedule")
  }

  const schedule: Schedule = {}

  for (let day = 1; day <= daysInMonth; day++) {
    schedule[day] = { shifts: [] }

    for (let shift = 0; shift < settings.shiftsPerDay; shift++) {
      const employeeIds: string[] = []
      const shiftIndex = (day - 1) * settings.shiftsPerDay + shift

      if (shiftIndex < geneticSchedule.length) {
        const employeeAssignments = geneticSchedule[shiftIndex]

        for (
          let empIndex = 0;
          empIndex < employeeAssignments.length;
          empIndex++
        ) {
          if (employeeAssignments[empIndex] && empIndex < employees.length) {
            employeeIds.push(employees[empIndex].id)
          }
        }
      } else {
        throw new Error("schedule generated is too short")
      }

      schedule[day].shifts.push({ employeeIds })
    }
  }

  return schedule
}
// Fitness function to evaluate schedule quality (lower is better)
const calcFitness = (
  geneticSchedule: OptimizedScheduleGenetic,
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  daysInMonth: number,
  selectedMonth: number,
  selectedYear: number
): number => {
  let penalty = 0

  // Penalty weights
  const PENALTY = {
    // Global
    MAX_CONSECUTIVE_SHIFTS: 100,
    MAX_CONSECUTIVE_DAYS: 100,
    ENOUGH_REST_DAYS: 100,
    MULTIPLE_SHIFTS_PER_DAY: 100,
    MIN_WEEK_SHIFT: 100, //TODO
    MAX_WEEK_SHIFT: 100, //TODO
    WEEKEND_IMBALANCE: 100, //TODO
    ROOKIE_TAG: 100, //TODO
    VETERAN_TAG: 100, //TODO
    WEEKEND_SHIFT_TAG: 100, //TODO
    // Individual
    TOTAL_SHIFT_COUNT: 100,
    WEEKDAY_SHIFT_COUNT: 100,
    WEEKEND_SHIFT_COUNT: 100,
    AVOID_VIOLATION: 100,
    PREFER_VIOLATION: 10,
    // experimental
    HUMAN: 1,
  } as const

  // Track employee shift counts and work patterns
  const employeeShiftCounts = new Array(employees.length).fill(0)
  const employeeWorkDays = employees.map(() => new Array<number>())
  const employeeWorkShifts = employees.map(() => new Array<number>())
  const employeeWeekendShifts = new Array(employees.length).fill(0)
  const employeeWeekdayShifts = new Array(employees.length).fill(0)

  // Validate each shift
  for (let day = 1; day <= daysInMonth; day++) {
    for (let shift = 0; shift < settings.shiftsPerDay; shift++) {
      const shiftIndex = (day - 1) * settings.shiftsPerDay + shift

      const employeeAssignments = geneticSchedule[shiftIndex]

      // Track employee assignments
      for (
        let empIndex = 0;
        empIndex < employeeAssignments.length;
        empIndex++
      ) {
        if (employeeAssignments[empIndex]) {
          employeeWorkDays[empIndex].push(day)
          employeeWorkShifts[empIndex].push(shiftIndex)
          employeeShiftCounts[empIndex]++

          // Track weekend vs weekday shifts
          if (isWeekend(day, selectedMonth, selectedYear)) {
            employeeWeekendShifts[empIndex]++
          } else {
            employeeWeekdayShifts[empIndex]++
          }
        }
      }
    }
  }

  // Check employee constraints
  employees.forEach((employee, empIndex) => {
    const shiftCount = employeeShiftCounts[empIndex]
    const weekendCount = employeeWeekendShifts[empIndex]
    const weekdayCount = employeeWeekdayShifts[empIndex]
    const workDays = employeeWorkDays[empIndex]
    const workShifts = employeeWorkShifts[empIndex]

    // Min/max shifts per month
    if (shiftCount < employee.shiftsPerMonth[0]) {
      penalty +=
        PENALTY.TOTAL_SHIFT_COUNT * (employee.shiftsPerMonth[0] - shiftCount)
    }
    if (shiftCount > employee.shiftsPerMonth[1]) {
      penalty +=
        PENALTY.TOTAL_SHIFT_COUNT * (shiftCount - employee.shiftsPerMonth[1])
    }

    // Weekend shifts constraints
    if (weekendCount < employee.weekendShifts[0]) {
      penalty +=
        PENALTY.WEEKDAY_SHIFT_COUNT * (employee.weekendShifts[0] - weekendCount)
    }
    if (weekendCount > employee.weekendShifts[1]) {
      penalty +=
        PENALTY.WEEKDAY_SHIFT_COUNT * (weekendCount - employee.weekendShifts[1])
    }

    // Weekday shifts constraints
    if (weekdayCount < employee.weekdayShifts[0]) {
      penalty +=
        PENALTY.WEEKEND_SHIFT_COUNT * (employee.weekdayShifts[0] - weekdayCount)
    }
    if (weekdayCount > employee.weekdayShifts[1]) {
      penalty +=
        PENALTY.WEEKEND_SHIFT_COUNT * (weekdayCount - employee.weekdayShifts[1])
    }

    let consecutiveDay = 1
    let consecutiveShift = 1
    let lastDay = workDays[0]
    let lastShift = workShifts[0]

    for (let i = 1; i < workShifts.length; i++) {
      const today = workDays[i]
      const thisShift = workShifts[i]
      if (thisShift === lastShift + 1) {
        consecutiveShift++
        if (consecutiveShift > settings.maxConsecutiveShifts) {
          penalty +=
            PENALTY.MAX_CONSECUTIVE_SHIFTS *
            (consecutiveShift - settings.maxConsecutiveShifts)
        }
      } else {
        consecutiveShift = 1
      }
      if (today === lastDay && settings.preventMultipleShiftsPerDay) {
        penalty += PENALTY.MULTIPLE_SHIFTS_PER_DAY
      }
      if (today === lastDay + 1) {
        consecutiveDay++
        if (consecutiveDay > settings.maxConsecutiveDays) {
          penalty +=
            PENALTY.MAX_CONSECUTIVE_DAYS *
            (consecutiveDay - settings.maxConsecutiveDays)
        }
      } else if (today > lastDay + 1) {
        consecutiveDay = 1
        if (today - lastDay - 1 < settings.minRestDaysBetweenShifts) {
          penalty +=
            PENALTY.ENOUGH_REST_DAYS *
            (lastDay + 1 + settings.minRestDaysBetweenShifts - today) *
            (lastDay + 1 + settings.minRestDaysBetweenShifts - today)
        }
      }
      lastDay = today
      lastShift = thisShift
    }
  })

  // Check constraint preferences
  constraints.forEach((constraint) => {
    const empIndex = employees.findIndex(
      (emp) => emp.id === constraint.employeeId
    )
    if (empIndex === -1) return

    const shiftIndex =
      (constraint.date - 1) * settings.shiftsPerDay + constraint.shiftIndex
    if (shiftIndex >= geneticSchedule.length) return

    const isAssigned = geneticSchedule[shiftIndex][empIndex]

    if (constraint.type === "avoid" && isAssigned) {
      penalty += PENALTY.AVOID_VIOLATION
    } else if (constraint.type === "prefer" && !isAssigned) {
      penalty += PENALTY.PREFER_VIOLATION
    }
  })

  return penalty
}

const mutateSchedule = (
  newSchedule: OptimizedScheduleGenetic,
  setting: ScheduleSettings,
  daysInMonth: number
): OptimizedScheduleGenetic => {
  // Four modes of operation, with 50% chance of getting shift random.
  const operations = [
    "swap_shift",
    "move_shift",
    "transport_shift",
    "shift_random",
    "shift_random",
    "shift_random",
  ]

  const operation = operations[randint(operations.length)]
  switch (operation) {
    case "swap_shift": {
      const day1 = randint(daysInMonth)
      const day2 = randint(daysInMonth)
      const shift = randint(setting.shiftsPerDay)
      const idx1 = day1 * setting.shiftsPerDay + shift
      const idx2 = day2 * setting.shiftsPerDay + shift
      ;[newSchedule[idx1], newSchedule[idx2]] = [
        newSchedule[idx2],
        newSchedule[idx1],
      ]
      break
    }

    case "move_shift": {
      const day1 = randint(daysInMonth)
      const day2 = randint(daysInMonth)
      const shifts = newSchedule.splice(
        day1 * setting.shiftsPerDay,
        setting.shiftsPerDay
      )
      newSchedule.splice(day2 * setting.shiftsPerDay, 0, ...shifts)
      break
    }

    case "transport_shift": {
      const day1 = randint(daysInMonth)
      const day2 = randint(daysInMonth)

      const start = Math.min(day1, day2)
      const end = Math.max(day1, day2)

      // Extract the segment [start, end]
      const segment = newSchedule.splice(
        start * setting.shiftsPerDay,
        (end - start + 1) * setting.shiftsPerDay
      )

      // Choose insertion position k (excluding the original range)
      const day3 = randint(daysInMonth)

      // Insert the segment at position k
      newSchedule.splice(day3 * setting.shiftsPerDay, 0, ...segment)
      break
    }

    case "shift_random": {
      const i = randint(newSchedule.length)
      for (let k = newSchedule[i].length - 1; k > 0; k--) {
        const j = randint(k + 1)
        ;[newSchedule[i][k], newSchedule[i][j]] = [
          newSchedule[i][j],
          newSchedule[i][k],
        ]
      }
    }
  }

  return newSchedule
}

// Pick two random numbers 0 < i, j < |S|
// Son: father's [0, i) + mother's [i, j) + father's [j, |S|)
// Daughter: mother's [0, i) + father's [i, j) + mother's [j, |S|)
const crossoverSchedules = (
  parent1: OptimizedScheduleGenetic,
  parent2: OptimizedScheduleGenetic
): [OptimizedScheduleGenetic, OptimizedScheduleGenetic] => {
  const totalShiftsNeeded = parent1.length

  // Cannot mate if shifts < 2
  if (totalShiftsNeeded < 2) {
    return [parent1, parent2]
  }

  // Generate two random crossover points where i < j
  let i = randint(totalShiftsNeeded)
  let j = randint(totalShiftsNeeded)

  while (i === j) {
    j = randint(totalShiftsNeeded)
  }

  // Ensure i < j
  if (i > j) {
    ;[i, j] = [j, i]
  }

  const son: OptimizedScheduleGenetic = []
  const daughter: OptimizedScheduleGenetic = []

  for (let shiftIndex = 0; shiftIndex < totalShiftsNeeded; shiftIndex++) {
    if (shiftIndex < i) {
      // [0, i): son gets father, daughter gets mother
      son.push([...parent1[shiftIndex]])
      daughter.push([...parent2[shiftIndex]])
    } else if (shiftIndex < j) {
      // [i, j): son gets mother, daughter gets father
      son.push([...parent2[shiftIndex]])
      daughter.push([...parent1[shiftIndex]])
    } else {
      // [j, totalShiftsNeeded): son gets father, daughter gets mother
      son.push([...parent1[shiftIndex]])
      daughter.push([...parent2[shiftIndex]])
    }
  }

  return [son, daughter]
}

// Generate initial schedule
const genInitialSchedule = (
  employees: Employee[],
  settings: ScheduleSettings,
  totalShiftNeeded: number
): OptimizedScheduleGenetic => {
  const schedule: OptimizedScheduleGenetic = Array.from(
    { length: totalShiftNeeded },
    (_, i) => {
      const personNeeded = settings.personsPerShift[i % settings.shiftsPerDay]
      const values = Array(personNeeded)
        .fill(true)
        .concat(Array(employees.length - personNeeded).fill(false))
      for (let k = values.length - 1; k > 0; k--) {
        const j = randint(k + 1)
        ;[values[k], values[j]] = [values[j], values[k]]
      }
      return values
    }
  )
  return schedule
}

export const generateScheduleGenetic = async (
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  selectedMonth: number,
  selectedYear: number
): Promise<{ schedule: Schedule; success: boolean; message: string }> => {
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)

  try {
    // Create genetic algorithm instance
    const geneticInstance = genetic.create<OptimizedScheduleGenetic>()

    // Set up the genetic algorithm functions
    geneticInstance.seed = () => {
      const result = genInitialSchedule(
        employees,
        settings,
        daysInMonth * settings.shiftsPerDay
      )
      return result
    }

    geneticInstance.fitness = (geneticSchedule: OptimizedScheduleGenetic) => {
      const fitness = calcFitness(
        geneticSchedule,
        employees,
        constraints,
        settings,
        daysInMonth,
        selectedMonth,
        selectedYear
      )
      return fitness
    }

    geneticInstance.mutate = (schedule) => {
      return mutateSchedule(schedule, settings, daysInMonth)
    }

    geneticInstance.crossover = crossoverSchedules

    geneticInstance.select1 = (pop) => {
      if (Math.random() <= 0.9) {
        return genetic.Select1.Tournament2(genetic.Optimize.Minimize, pop)
      } else {
        return genetic.Select1.Fittest(pop)
      }
    }

    geneticInstance.select2 = (pop) => {
      if (Math.random() <= 0.9) {
        return genetic.Select2.Tournament2(genetic.Optimize.Minimize, pop)
      } else {
        return genetic.Select2.FittestRandom(pop)
      }
    }

    geneticInstance.generation = (
      pop: Array<{ fitness: number; entity: OptimizedScheduleGenetic }>,
      generation: number,
      stats: { maximum: number; minimum: number; mean: number; stdev: number }
    ) => {
      if (generation % 10 === 0) {
        console.log(
          `Gen ${generation}: best = ${stats.maximum} stdev = ${stats.stdev}`
        )
      }
      const best = pop[0]
      if (best.fitness === 0) {
        // Shutdown if no loss
        return false
      }
      return true
    }

    const config: GeneticConfig = {
      size: 10,
      iterations: 30000,
      crossover: 0.5,
      mutation: 0.4,
      maxResults: 1,
      skip: 5,
    }

    console.log("Starting genetic algorithm with config:", config)

    // Run genetic algorithm with timeout
    const bestSchedule = await Promise.race([
      geneticInstance.evolve(config),
      new Promise<OptimizedScheduleGenetic>((_, reject) =>
        setTimeout(() => reject(new Error("Genetic algorithm timeout")), 30000)
      ),
    ])

    const schedule = optimizedToSchedule(
      bestSchedule,
      employees,
      settings,
      daysInMonth
    )
    const finalFitness = calcFitness(
      bestSchedule,
      employees,
      constraints,
      settings,
      daysInMonth,
      selectedMonth,
      selectedYear
    )

    return {
      schedule,
      success: true,
      message: `Genetic algorithm completed successfully. Final penalty score: ${finalFitness}`,
    }
  } catch (error) {
    console.error("Genetic algorithm error:", error)
    return {
      schedule: {},
      success: false,
      message: `Genetic algorithm failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    }
  }
}
