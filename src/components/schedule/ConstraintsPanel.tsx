import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScheduleSettings } from "@/types/schedule"

interface ConstraintsPanelProps {
  settings: ScheduleSettings
  onSettingsChange: (settings: ScheduleSettings) => void
}

export const ConstraintsPanel = ({
  settings,
  onSettingsChange,
}: ConstraintsPanelProps) => {
  const updateSetting = <K extends keyof ScheduleSettings>(
    key: K,
    value: ScheduleSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Scheduling Constraints</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure global rules that apply to the entire schedule generation
          process
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Shift Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shiftsPerDay">Shifts per Day</Label>
            <Input
              id="shiftsPerDay"
              type="number"
              min="1"
              max="3"
              value={settings.shiftsPerDay}
              onChange={(e) =>
                updateSetting(
                  "shiftsPerDay",
                  Number.parseInt(e.target.value) || 1
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Number of shifts each day (e.g., morning, evening)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personsPerShift">Persons per Shift</Label>
            <Input
              id="personsPerShift"
              type="number"
              min="1"
              max="10"
              value={settings.personsPerShift}
              onChange={(e) =>
                updateSetting(
                  "personsPerShift",
                  Number.parseInt(e.target.value) || 1
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Number of people needed for each shift
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxConsecutive">Max Consecutive Shifts</Label>
            <Input
              id="maxConsecutive"
              type="number"
              min="1"
              max="7"
              value={settings.maxConsecutiveShifts}
              onChange={(e) =>
                updateSetting(
                  "maxConsecutiveShifts",
                  Number.parseInt(e.target.value) || 1
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum shifts an employee can work in a row
            </p>
          </div>
        </div>

        {/* Rest and Recovery */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Rest and Recovery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minRestDays">
                Minimum Rest Days Between Shifts
              </Label>
              <Input
                id="minRestDays"
                type="number"
                min="0"
                max="3"
                value={settings.minRestDaysBetweenShifts}
                onChange={(e) =>
                  updateSetting(
                    "minRestDaysBetweenShifts",
                    Number.parseInt(e.target.value) || 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Minimum days off required between shift assignments
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.weekendCoverageRequired}
                  onChange={(e) =>
                    updateSetting("weekendCoverageRequired", e.target.checked)
                  }
                  className="rounded"
                />
                Weekend Coverage Required
              </Label>
              <p className="text-xs text-muted-foreground">
                Ensure shifts are covered on weekends (Saturday & Sunday)
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Limits */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Weekly Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minShiftsPerWeek">Minimum Shifts per Week</Label>
              <Input
                id="minShiftsPerWeek"
                type="number"
                min="0"
                max="7"
                value={settings.minShiftsPerWeek}
                onChange={(e) =>
                  updateSetting(
                    "minShiftsPerWeek",
                    Number.parseInt(e.target.value) || 0
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Minimum shifts each employee should work per week
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxShiftsPerWeek">Maximum Shifts per Week</Label>
              <Input
                id="maxShiftsPerWeek"
                type="number"
                min="1"
                max="7"
                value={settings.maxShiftsPerWeek}
                onChange={(e) =>
                  updateSetting(
                    "maxShiftsPerWeek",
                    Number.parseInt(e.target.value) || 1
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Maximum shifts each employee can work per week
              </p>
            </div>
          </div>
        </div>

        {/* Fairness and Distribution */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            Fairness and Distribution
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.evenDistribution}
                  onChange={(e) =>
                    updateSetting("evenDistribution", e.target.checked)
                  }
                  className="rounded"
                />
                Even Shift Distribution
              </Label>
              <p className="text-xs text-muted-foreground">
                Attempt to distribute shifts evenly among all employees to
                ensure fairness
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-6 bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Constraint Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Daily:</strong> {settings.shiftsPerDay} shift(s),{" "}
                {settings.personsPerShift} person(s) each
              </p>
              <p>
                <strong>Consecutive:</strong> Max{" "}
                {settings.maxConsecutiveShifts} shifts in a row
              </p>
              <p>
                <strong>Rest:</strong> {settings.minRestDaysBetweenShifts}{" "}
                day(s) minimum between shifts
              </p>
            </div>
            <div>
              <p>
                <strong>Weekly:</strong> {settings.minShiftsPerWeek}-
                {settings.maxShiftsPerWeek} shifts per person
              </p>
              <p>
                <strong>Weekend:</strong>{" "}
                {settings.weekendCoverageRequired ? "Required" : "Optional"}
              </p>
              <p>
                <strong>Distribution:</strong>{" "}
                {settings.evenDistribution ? "Even" : "Flexible"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
