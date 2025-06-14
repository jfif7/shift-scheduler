import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileImage } from "lucide-react"
import { Employee, Schedule } from "@/types/schedule"
import { exportScheduleAsCSV, exportScheduleAsImage } from "@/utils/exportUtils"
import { useToast } from "@/hooks/use-toast"

interface ScheduleActionsProps {
  schedule: Schedule
  employees: Employee[]
  selectedMonth: string
  selectedYear: string
  onGenerateSchedule: () => void
  isGenerating?: boolean
}

export const ScheduleActions = ({
  schedule,
  employees,
  selectedMonth,
  selectedYear,
  onGenerateSchedule,
  isGenerating = false,
}: ScheduleActionsProps) => {
  const { toast } = useToast()

  const handleExportCSV = () => {
    if (Object.keys(schedule).length === 0) {
      toast({
        title: "No schedule",
        description: "Please generate a schedule first.",
        variant: "destructive",
      })
      return
    }

    try {
      exportScheduleAsCSV(schedule, employees, selectedMonth, selectedYear)
      toast({
        title: "CSV exported",
        description: "Schedule has been exported as CSV file.",
      })
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export CSV file.",
        variant: "destructive",
      })
    }
  }

  const handleExportImage = () => {
    if (Object.keys(schedule).length === 0) {
      toast({
        title: "No schedule",
        description: "Please generate a schedule first.",
        variant: "destructive",
      })
      return
    }

    try {
      exportScheduleAsImage(schedule, employees, selectedMonth, selectedYear)
      toast({
        title: "Image exported",
        description: "Schedule has been exported as PNG image.",
      })
    } catch {
      toast({
        title: "Export failed",
        description: "Failed to export image file.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Schedule Generation
          <div className="flex gap-2">
            <Button
              onClick={onGenerateSchedule}
              disabled={employees.length === 0 || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Schedule"}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={Object.keys(schedule).length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleExportImage}
              disabled={Object.keys(schedule).length === 0}
            >
              <FileImage className="w-4 h-4 mr-2" />
              Export Image
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-muted-foreground">
            Add employees in the Setup tab before generating a schedule.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ready to generate schedule for {employees.length} employee(s) in{" "}
              {selectedMonth && selectedYear
                ? `${selectedMonth}/${selectedYear}`
                : "selected month"}
              .
            </p>
            {Object.keys(schedule).length > 0 && (
              <p className="text-sm text-green-600">
                ✓ Schedule generated successfully! You can now export it or
                generate a new one.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
