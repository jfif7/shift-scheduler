import { useState } from "react"
import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
  getTotalSlotsNeeded,
} from "@/types/schedule"
import { generateSchedule } from "@/utils/algo/simulatedAnnealing"
import { generateScheduleGenetic } from "@/utils/algo/genetic"
import {
  generateScheduleWithCPSAT,
  testConnection,
  ScheduleAPIError,
  ScheduleTimeoutError,
  ScheduleServerError,
  APISolverMetadata,
} from "@/services/scheduleAPI"
import { getDaysInMonth } from "@/utils/dateUtils"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export type SchedulingAlgorithm =
  | "cp-sat"
  | "simulated-annealing"
  | "genetic"
  | "auto"

export const useScheduleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const t = useTranslations()

  // Feasibility check function to validate if schedule generation is possible
  const checkScheduleFeasibility = (
    employees: Employee[],
    settings: ScheduleSettings,
    selectedMonth: number,
    selectedYear: number
  ): { feasible: boolean; message: string } => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const totalShiftsNeeded = getTotalSlotsNeeded(daysInMonth, settings)

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
        feasible: false,
        message: t("generation.errorNotEnoughShifts", {
          totalMaxShifts: totalMaxShifts,
          totalShiftsNeeded: totalShiftsNeeded,
        }),
      }
    }

    if (totalMinShifts > totalShiftsNeeded) {
      return {
        feasible: false,
        message: t("generation.errorTooManyShifts", {
          totalMinShifts: totalMinShifts,
          totalShiftsNeeded: totalShiftsNeeded,
        }),
      }
    }

    return { feasible: true, message: "Schedule generation is feasible" }
  }

  const handleGenerateSchedule = async (
    employees: Employee[],
    constraints: Constraint[],
    settings: ScheduleSettings,
    selectedMonth: number,
    selectedYear: number,
    setSchedule: (schedule: Schedule) => void,
    algorithm?: SchedulingAlgorithm
  ) => {
    setIsGenerating(true)

    try {
      // Use algorithm from parameter or settings, fallback to auto
      let selectedAlgorithm = algorithm || settings.preferredAlgorithm || "auto"

      // Auto-select algorithm
      if (selectedAlgorithm === "auto") {
        // First, try to use CP-SAT if available
        const connection = await testConnection()

        if (connection.available) {
          selectedAlgorithm = "cp-sat"
        } else {
          // Fallback to local algorithms
          console.log(
            "CP-SAT server not available, falling back to local algorithms"
          )
          if (settings.shiftsPerDay === 1) {
            selectedAlgorithm = "simulated-annealing"
          } else {
            selectedAlgorithm = "genetic"
          }
        }
      }

      // Check schedule feasibility before proceeding with any algorithm
      const feasibilityCheck = checkScheduleFeasibility(
        employees,
        settings,
        selectedMonth,
        selectedYear
      )

      if (!feasibilityCheck.feasible) {
        toast.error(t("generation.generationFailed"), {
          description: feasibilityCheck.message,
        })
        return
      }

      let result: {
        schedule: Schedule
        success: boolean
        message: string
        metadata?: APISolverMetadata
        payloadSize?: { request: number; response: number }
      }

      switch (selectedAlgorithm) {
        case "cp-sat":
          console.log("Using CP-SAT solver...")

          // Add small delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 500))

          try {
            console.log("Using JSON API for CP-SAT...")
            result = await generateScheduleWithCPSAT(
              employees,
              constraints,
              settings,
              selectedMonth,
              selectedYear,
              30 // 30 second timeout
            )

            // Add solver metadata to success message
            if (result.success && result.metadata) {
              const { solve_time, objective_value, constraints_satisfied } =
                result.metadata
              result.message += ` (Solved in ${solve_time.toFixed(
                2
              )}s, objective: ${objective_value}, constraints: ${
                constraints_satisfied ? "all satisfied" : "some violated"
              })`
            }
          } catch (error) {
            // Handle CP-SAT specific errors and fallback
            if (error instanceof ScheduleTimeoutError) {
              toast.error("CP-SAT solver timeout", {
                description:
                  "The solver took too long. Trying fallback algorithm...",
              })
            } else if (error instanceof ScheduleServerError) {
              toast.error("CP-SAT server error", {
                description:
                  "Server issue detected. Trying fallback algorithm...",
              })
            } else if (error instanceof ScheduleAPIError) {
              toast.error("CP-SAT connection error", {
                description:
                  "Cannot connect to solver. Trying fallback algorithm...",
              })
            }

            console.log(
              "CP-SAT failed, falling back to genetic algorithm:",
              error
            )

            // Fallback to genetic algorithm
            selectedAlgorithm = "genetic"
            result = await generateScheduleGenetic(
              employees,
              constraints,
              settings,
              selectedMonth,
              selectedYear
            )
            result.message = `Fallback: ${result.message}`
          }
          break

        case "genetic":
          console.log("Using genetic algorithm...")

          // Add small delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 500))

          result = await generateScheduleGenetic(
            employees,
            constraints,
            settings,
            selectedMonth,
            selectedYear
          )
          break

        case "simulated-annealing":
        default:
          console.log("Using simulated annealing algorithm...")

          // Add small delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 500))

          result = generateSchedule(
            employees,
            constraints,
            settings,
            selectedMonth,
            selectedYear
          )
          break
      }

      if (result.success) {
        setSchedule(result.schedule)

        // Show different success messages based on algorithm used
        let algorithmName: string
        switch (selectedAlgorithm) {
          case "cp-sat":
            algorithmName = "CP-SAT Solver"
            break
          case "genetic":
            algorithmName = "Genetic Algorithm"
            break
          case "simulated-annealing":
          default:
            algorithmName = "Simulated Annealing"
            break
        }

        toast.success(
          t("generation.generationSuccess", {
            algorithm: algorithmName,
          }),
          {
            description: result.message,
          }
        )
      } else {
        toast.error(t("generation.generationFailed"), {
          description: result.message,
        })
      }
    } catch (error) {
      console.error("Schedule generation error:", error)
      toast.error("Generation error", {
        description:
          "An unexpected error occurred while generating the schedule.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    handleGenerateSchedule,
  }
}
