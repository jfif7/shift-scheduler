import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScheduleSettings } from "@/types/schedule"
import { useTranslations } from "next-intl"

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
            <Input
              id="shiftsPerDay"
              type="number"
              min="1"
              max="3"
              value={settings.shiftsPerDay}
              onChange={(e) => {
                const newShiftsPerDay = Number.parseInt(e.target.value) || 1
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
              }}
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
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={persons}
                  onChange={(e) => {
                    const newPersonsPerShift = [...settings.personsPerShift]
                    newPersonsPerShift[shiftIndex] =
                      Number.parseInt(e.target.value) || 1
                    updateSetting("personsPerShift", newPersonsPerShift)
                  }}
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
                    {t("shiftPreferences.shiftLabel", { index: shiftIndex + 1 })}:
                  </Label>
                  <Input
                    type="text"
                    value={label}
                    placeholder={t("settings.shiftLabelPlaceholder", { index: shiftIndex + 1 })}
                    onChange={(e) => {
                      const newShiftLabels = [...(settings.shiftLabels || [])]
                      newShiftLabels[shiftIndex] = e.target.value || `Shift ${shiftIndex + 1}`
                      updateSetting("shiftLabels", newShiftLabels)
                    }}
                    className="flex-1"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                {t("settings.customizeShiftNames")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maxConsecutive">
              {t("constraints.maxConsecutiveShifts")}
            </Label>
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
              {t("constraints.maxConsecutiveShiftsDescription")}
            </p>
          </div>
        </div>

        {/* Rest and Recovery */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">
            {t("constraints.restAndRecovery")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minRestDays">
                {t("constraints.minRestDaysBetweenShifts")}
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
                {t("constraints.minRestDaysBetweenShiftsDescription")}
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
                {t("constraints.weekendCoverageRequired")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("constraints.weekendCoverageRequiredDescription")}
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
                {t("constraints.minShiftsPerWeekDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxShiftsPerWeek">
                {t("constraints.maxShiftsPerWeek")}
              </Label>
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
                {settings.shiftsPerDay} {t("constraints.shifts")},{" "}
                {settings.personsPerShift} {t("constraints.persons")}{" "}
                {t("constraints.each")}
              </p>
              <p>
                <strong>{t("constraints.consecutive")}:</strong>{" "}
                {t("constraints.max")} {settings.maxConsecutiveShifts}{" "}
                {t("constraints.inARow")}
              </p>
              <p>
                <strong>{t("constraints.rest")}:</strong>{" "}
                {settings.minRestDaysBetweenShifts}{" "}
                {t("constraints.dayMinimum")}
              </p>
            </div>
            <div>
              <p>
                <strong>{t("constraints.weekly")}:</strong>{" "}
                {settings.minShiftsPerWeek}-{settings.maxShiftsPerWeek}{" "}
                {t("constraints.shiftsPerPerson")}
              </p>
              <p>
                <strong>{t("constraints.weekend")}:</strong>{" "}
                {settings.weekendCoverageRequired
                  ? t("constraints.required")
                  : t("constraints.optional")}
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
      </CardContent>
    </Card>
  )
}
