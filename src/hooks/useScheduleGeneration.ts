import { useState } from "react"
import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
} from "@/types/schedule"
import { generateSchedule } from "@/utils/scheduleUtils"
import { useToast } from "@/hooks/use-toast"

export const useScheduleGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateSchedule = async (
    employees: Employee[],
    constraints: Constraint[],
    settings: ScheduleSettings,
    selectedMonth: string,
    selectedYear: string,
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
        toast({
          title: "Schedule generated",
          description: result.message,
        })
      } else {
        toast({
          title: "Generation failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Generation error",
        description:
          "An unexpected error occurred while generating the schedule.",
        variant: "destructive",
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
