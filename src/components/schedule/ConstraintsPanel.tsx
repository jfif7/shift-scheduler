import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
import { TextInput } from "@/components/ui/text-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScheduleSettings } from "@/types/schedule"
import { useTranslations } from "next-intl"
import { ServerStatus } from "./ServerStatus"

interface ConstraintsPanelProps {
  settings: ScheduleSettings
  onSettingsChange: (settings: ScheduleSettings) => void
}

export const ConstraintsPanel = ({
  settings,
  onSettingsChange,
}: ConstraintsPanelProps) => {
  const t = useTranslations()

  const updateSetting = <K extends keyof ScheduleSettings>(
    key: K,
    value: ScheduleSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  const handleShiftsPerDayChange = (newShiftsPerDay: number) => {
    // Ensure personsPerShift array matches shiftsPerDay length
    const newPersonsPerShift = Array.from(
      { length: newShiftsPerDay },
      (_, i) => settings.personsPerShift[i] || 1
    )
    // Ensure shiftLabels array matches shiftsPerDay length
    const newShiftLabels = Array.from(
      { length: newShiftsPerDay },
      (_, i) => settings.shiftLabels?.[i] || `Shift ${i + 1}`
    )

    // Batch all updates into a single call
    onSettingsChange({
      ...settings,
      shiftsPerDay: newShiftsPerDay,
      personsPerShift: newPersonsPerShift,
      shiftLabels: newShiftLabels,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("constraints.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("constraints.description")}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Shift Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shiftsPerDay">
              {t("constraints.shiftsPerDay")}
            </Label>
            <NumberInput
              id="shiftsPerDay"
              value={settings.shiftsPerDay}
              onChange={handleShiftsPerDayChange}
              min={1}
              max={3}
              defaultValue={1}
            />
            <p className="text-xs text-muted-foreground">
              {t("constraints.shiftsPerDayDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("constraints.personsPerShift")}</Label>
            {settings.personsPerShift.map((persons, shiftIndex) => (
              <div key={shiftIndex} className="flex gap-2 items-center">
                <Label className="text-sm w-20">
                  {settings.shiftLabels?.[shiftIndex] ||
                    `Shift ${shiftIndex + 1}`}
                  :
                </Label>
                <NumberInput
                  value={persons}
                  onChange={(value) => {
                    const newPersonsPerShift = [...settings.personsPerShift]
                    newPersonsPerShift[shiftIndex] = value
                    updateSetting("personsPerShift", newPersonsPerShift)
                  }}
                  min={1}
                  max={10}
                  defaultValue={1}
                  className="w-20"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              {t("constraints.personsPerShiftDescription")}
            </p>
          </div>

          {/* Shift Labels Configuration */}
          {settings.shiftsPerDay > 1 && (
            <div className="space-y-2">
              <Label>{t("settings.shiftLabels")}</Label>
              {settings.shiftLabels?.map((label, shiftIndex) => (
                <div key={shiftIndex} className="flex gap-2 items-center">
                  <Label className="text-sm w-20">
                    {t("shiftPreferences.shiftLabel", {
                      index: shiftIndex + 1,
                    })}
                    :
                  </Label>
                  <TextInput
                    value={label}
                    placeholder={t("settings.shiftLabelPlaceholder", {
                      index: shiftIndex + 1,
                    })}
                    onChange={(newValue) => {
                      const newShiftLabels = [...(settings.shiftLabels || [])]
                      newShiftLabels[shiftIndex] = newValue || `Shift ${shiftIndex + 1}`
                      updateSetting("shiftLabels", newShiftLabels)
                    }}
                    className="flex-1"
                    maxLength={20}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                {t("settings.customizeShiftNames")}
              </p>
            </div>
          )}
        </div>

        {/* Rest and Recovery */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("constraints.restAndRecovery")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxConsecutive">
                {t("constraints.maxConsecutiveShifts")}
              </Label>
              <NumberInput
                id="maxConsecutive"
                value={settings.maxConsecutiveShifts}
                onChange={(value) =>
                  updateSetting("maxConsecutiveShifts", value)
                }
                min={1}
                max={7}
                defaultValue={1}
              />
              <p className="text-xs text-muted-foreground">
                {t("constraints.maxConsecutiveShiftsDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxConsecutiveDays">
                {t("constraints.maxConsecutiveDays")}
              </Label>
              <NumberInput
                id="maxConsecutiveDays"
                value={settings.maxConsecutiveDays}
                onChange={(value) => updateSetting("maxConsecutiveDays", value)}
                min={1}
                max={7}
                defaultValue={3}
              />
              <p className="text-xs text-muted-foreground">
                {t("constraints.maxConsecutiveDaysDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minRestDays">
                {t("constraints.minRestDaysBetweenShifts")}
              </Label>
              <NumberInput
                id="minRestDays"
                value={settings.minRestDaysBetweenShifts}
                onChange={(value) =>
                  updateSetting("minRestDaysBetweenShifts", value)
                }
                min={0}
                max={4}
                defaultValue={0}
              />
              <p className="text-xs text-muted-foreground">
                {t("constraints.minRestDaysBetweenShiftsDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.preventMultipleShiftsPerDay}
                  onChange={(e) =>
                    updateSetting(
                      "preventMultipleShiftsPerDay",
                      e.target.checked
                    )
                  }
                  className="rounded"
                />
                {t("constraints.preventMultipleShiftsPerDay")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("constraints.preventMultipleShiftsPerDayDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Limits */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("constraints.weeklyLimits")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minShiftsPerWeek">
                {t("constraints.minShiftsPerWeek")}
              </Label>
              <NumberInput
                id="minShiftsPerWeek"
                value={settings.minShiftsPerWeek}
                onChange={(value) => updateSetting("minShiftsPerWeek", value)}
                min={0}
                max={7}
                defaultValue={0}
              />
              <p className="text-xs text-muted-foreground">
                {t("constraints.minShiftsPerWeekDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxShiftsPerWeek">
                {t("constraints.maxShiftsPerWeek")}
              </Label>
              <NumberInput
                id="maxShiftsPerWeek"
                value={settings.maxShiftsPerWeek}
                onChange={(value) => updateSetting("maxShiftsPerWeek", value)}
                min={1}
                max={7}
                defaultValue={1}
              />
              <p className="text-xs text-muted-foreground">
                {t("constraints.maxShiftsPerWeekDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Fairness and Distribution */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("constraints.fairnessAndDistribution")}
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
                {t("constraints.evenShiftDistribution")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("constraints.evenShiftDistributionDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-6 bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">
            {t("constraints.constraintSummary")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>{t("constraints.daily")}:</strong>{" "}
                {t("constraints.dailySummary", {
                  shiftsPerDay: settings.shiftsPerDay,
                  personsPerShift: settings.personsPerShift.join(
                    t("constraints.separator")
                  ),
                })}
              </p>
              <p>
                <strong>{t("constraints.consecutive")}:</strong>{" "}
                {t("constraints.consecutiveSummary", {
                  maxShifts: settings.maxConsecutiveShifts,
                  maxDays: settings.maxConsecutiveDays,
                })}
              </p>
              <p>
                <strong>{t("constraints.rest")}:</strong>{" "}
                {t("constraints.restSummary", {
                  days: settings.minRestDaysBetweenShifts,
                })}
              </p>
              <p>
                <strong>{t("constraints.multipleShifts")}:</strong>{" "}
                {settings.preventMultipleShiftsPerDay
                  ? t("constraints.prevented")
                  : t("constraints.allowed")}
              </p>
            </div>
            <div>
              <p>
                <strong>{t("constraints.weekly")}:</strong>{" "}
                {t("constraints.weeklySummary", {
                  minShifts: settings.minShiftsPerWeek,
                  maxShifts: settings.maxShiftsPerWeek,
                })}
              </p>
              <p>
                <strong>{t("constraints.distribution")}:</strong>{" "}
                {settings.evenDistribution
                  ? t("constraints.even")
                  : t("constraints.flexible")}
              </p>
            </div>
          </div>
        </div>

        {/* Algorithm Selection */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Scheduling Algorithm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preferredAlgorithm">Preferred Algorithm</Label>
              <Select
                value={settings.preferredAlgorithm}
                onValueChange={(value) => updateSetting("preferredAlgorithm", value as "auto" | "cp-sat" | "genetic" | "simulated-annealing")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Recommended)</SelectItem>
                  <SelectItem value="cp-sat">CP-SAT Solver (Best Quality)</SelectItem>
                  <SelectItem value="genetic">Genetic Algorithm (Fast)</SelectItem>
                  <SelectItem value="simulated-annealing">Simulated Annealing (Simple)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Auto:</strong> Uses CP-SAT if available, falls back to genetic/simulated annealing</p>
                <p><strong>CP-SAT:</strong> Google&apos;s constraint programming solver - highest quality results</p>
                <p><strong>Genetic:</strong> Good for complex multi-shift schedules</p>
                <p><strong>Simulated Annealing:</strong> Simple algorithm for basic single-shift schedules</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Server Status</Label>
              <ServerStatus showDetails={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
