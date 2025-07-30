import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DualRangeSlider } from "@/components/ui/dual-range-slider"
import { Trash2, Copy } from "lucide-react"
import { Employee } from "@/types/schedule"
import { useTranslations } from "next-intl"

interface EmployeeCardProps {
  employee: Employee
  isSelected: boolean
  isEditing: boolean
  predefinedTags: string[]
  onEmployeeSelect: (id: string) => void
  onRemoveEmployee: (id: string) => void
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void
  onToggleTag: (employeeId: string, tag: string) => void
  onStartEditing: (employee: Employee) => void
  onStopEditing: () => void
  onApplyToAll: (shiftsData: {
    shiftsPerMonth: [number, number]
    weekdayShifts: [number, number]
    weekendShifts: [number, number]
  }) => void
}

export const EmployeeCard = ({
  employee,
  isSelected,
  isEditing,
  predefinedTags,
  onEmployeeSelect,
  onRemoveEmployee,
  onUpdateEmployee,
  onToggleTag,
  onStartEditing,
  onStopEditing,
  onApplyToAll,
}: EmployeeCardProps) => {
  const [editingName, setEditingName] = useState<string>("")
  const [editingShiftsPerMonth, setEditingShiftsPerMonth] = useState<
    [number, number]
  >([0, 0])
  const [editingWeekdayShifts, setEditingWeekdayShifts] = useState<
    [number, number]
  >([0, 0])
  const [editingWeekendShifts, setEditingWeekendShifts] = useState<
    [number, number]
  >([0, 0])
  const t = useTranslations()

  const startEditing = () => {
    setEditingName(employee.name)
    setEditingShiftsPerMonth(employee.shiftsPerMonth)
    setEditingWeekdayShifts(employee.weekdayShifts)
    setEditingWeekendShifts(employee.weekendShifts)
    onStartEditing(employee)
  }

  const saveEdits = () => {
    onUpdateEmployee(employee.id, {
      name: editingName,
      shiftsPerMonth: editingShiftsPerMonth,
      weekdayShifts: editingWeekdayShifts,
      weekendShifts: editingWeekendShifts,
    })

    onStopEditing()
  }

  return (
    <div
      className={`border rounded-lg transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isEditing ? (
        // Editing mode
        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="editName" className="mb-1">
              {t("employees.name")}
            </Label>
            <Input
              id="editName"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              placeholder={t("employees.namePlaceholder")}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("employees.shiftsRangeNote")}
          </p>
          <div>
            <Label className="mb-2">
              {t("employees.minMaxShiftsPerMonth")}
            </Label>
            <div className="px-3 mb-8">
              <DualRangeSlider
                value={editingShiftsPerMonth}
                onValueChange={(value) =>
                  setEditingShiftsPerMonth(value as [number, number])
                }
                max={31}
                min={0}
                step={1}
                className="w-full"
                label={(value) => value?.toString()}
                labelPosition="bottom"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2">{t("employees.minMaxWeekdayShifts")}</Label>
            <div className="px-3 mb-8">
              <DualRangeSlider
                value={editingWeekdayShifts}
                onValueChange={(value) =>
                  setEditingWeekdayShifts(value as [number, number])
                }
                max={23}
                min={0}
                step={1}
                className="w-full"
                label={(value) => value?.toString()}
                labelPosition="bottom"
              />
            </div>
          </div>

          <div>
            <Label className="mb-2">{t("employees.minMaxWeekendShifts")}</Label>
            <div className="px-3 mb-8">
              <DualRangeSlider
                value={editingWeekendShifts}
                onValueChange={(value) =>
                  setEditingWeekendShifts(value as [number, number])
                }
                max={9}
                min={0}
                step={1}
                className="w-full"
                label={(value) => value?.toString()}
                labelPosition="bottom"
              />
            </div>
          </div>

          <div>
            <Label>{t("employees.tags")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedTags.map((tag) => {
                const hasTag = employee.tags.includes(tag)
                return (
                  <Button
                    key={tag}
                    variant={hasTag ? "default" : "outline"}
                    size="sm"
                    onClick={() => onToggleTag(employee.id, tag)}
                  >
                    {t(tag)}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={saveEdits} size="sm" className="flex-1">
                {t("employees.save")}
              </Button>
              <Button
                onClick={onStopEditing}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {t("employees.cancel")}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const confirmed = window.confirm(
                    t("employees.applyToAllEmployees") + "?"
                  )
                  if (confirmed) {
                    onApplyToAll({
                      shiftsPerMonth: editingShiftsPerMonth,
                      weekdayShifts: editingWeekdayShifts,
                      weekendShifts: editingWeekendShifts,
                    })
                    onStopEditing()
                  }
                }}
                variant="secondary"
                size="sm"
                title={t("employees.applyToAllTooltip")}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-1" />
                {t("employees.applyToAll")}
              </Button>
              <Button
                onClick={() => {
                  onRemoveEmployee(employee.id)
                  onStopEditing()
                }}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t("employees.delete")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Display mode
        <div
          className="p-3 cursor-pointer"
          onClick={() => onEmployeeSelect(isSelected ? "" : employee.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{employee.name}</span>
                <Badge variant="secondary">
                  {employee.shiftsPerMonth[0] === employee.shiftsPerMonth[1]
                    ? `${employee.shiftsPerMonth[0]} ${t("employees.shifts")}`
                    : `${employee.shiftsPerMonth[0]}-${
                        employee.shiftsPerMonth[1]
                      } ${t("employees.shifts")}`}
                </Badge>
              </div>
              {employee.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {employee.tags.map((tag) => (
                    <Badge key={t(tag)} variant="outline" className="text-xs">
                      {t(tag)}
                    </Badge>
                  ))}
                </div>
              )}
              {isSelected && (
                <div className="mt-2 text-xs text-blue-600">
                  {t("employees.selectedDescription")}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                startEditing()
              }}
            >
              {t("employees.edit")}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
