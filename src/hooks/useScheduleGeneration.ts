import { useState } from "react"
import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
} from "@/types/schedule"
import { generateSchedule } from "@/utils/algo/simulatedAnnealing"
import { generateScheduleGenetic } from "@/utils/algo/genetic"
import { toast } from "sonner"

export type SchedulingAlgorithm = "simulated-annealing" | "genetic" | "auto"

export const useScheduleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSchedule = async (
    employees: Employee[],
    constraints: Constraint[],
    settings: ScheduleSettings,
    selectedMonth: number,
    selectedYear: number,
    setSchedule: (schedule: Schedule) => void,
    algorithm: SchedulingAlgorithm = "auto"
  ) => {
    setIsGenerating(true)

    try {
      if (algorithm === "auto") {
        if (settings.shiftsPerDay === 1) {
          algorithm = "simulated-annealing"
        } else {
          algorithm = "genetic"
        }
      }
      // Add small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      let result: { schedule: Schedule; success: boolean; message: string }

      switch (algorithm) {
        case "genetic":
          console.log("Using genetic algorithm...")
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
        const algorithmName =
          algorithm === "genetic" ? "Genetic Algorithm" : "Simulated Annealing"

        toast.success(`Schedule generated with ${algorithmName}`, {
          description: result.message,
        })
      } else {
        toast.error("Generation failed", {
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
