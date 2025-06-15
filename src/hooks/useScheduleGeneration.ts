import { useState } from "react"
import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
} from "@/types/schedule"
import { generateSchedule } from "@/utils/scheduleUtils"
import { toast } from "sonner"

export const useScheduleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSchedule = async (
    employees: Employee[],
    constraints: Constraint[],
    settings: ScheduleSettings,
    selectedMonth: number,
    selectedYear: number,
    setSchedule: (schedule: Schedule) => void
  ) => {
    setIsGenerating(true)

    try {
      // Add small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = generateSchedule(
        employees,
        constraints,
        settings,
        selectedMonth,
        selectedYear
      )

      if (result.success) {
        setSchedule(result.schedule)
        toast.success("Schedule generated", {
          description: result.message,
        })
      } else {
        toast.error("Generation failed", {
          description: result.message,
        })
      }
    } catch {
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
