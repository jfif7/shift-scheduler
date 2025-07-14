import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
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
}: EmployeeCardProps) => {
  const [editingName, setEditingName] = useState<string>("")
  const [editingMinShifts, setEditingMinShifts] = useState<number>(0)
  const [editingMaxShifts, setEditingMaxShifts] = useState<number>(0)
  const t = useTranslations()

  const startEditing = () => {
    setEditingName(employee.name)
    setEditingMinShifts(employee.minShiftsPerMonth)
    setEditingMaxShifts(employee.maxShiftsPerMonth)
    onStartEditing(employee)
  }

  const saveEdits = () => {
    // Validate that min shifts doesn't exceed max shifts
    if (editingMinShifts > editingMaxShifts) {
      // Swap them if they're in wrong order
      onUpdateEmployee(employee.id, {
        name: editingName,
        minShiftsPerMonth: editingMaxShifts,
        maxShiftsPerMonth: editingMinShifts,
      })
    } else {
      onUpdateEmployee(employee.id, {
        name: editingName,
        minShiftsPerMonth: editingMinShifts,
        maxShiftsPerMonth: editingMaxShifts,
      })
    }
    onStopEditing()
  }

  const cancelEdits = () => {
    setEditingName("")
    setEditingMinShifts(0)
    setEditingMaxShifts(0)
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editMinShifts" className="mb-1">
                {t("employees.minShiftsPerMonth")}
              </Label>
              <Input
                id="editMinShifts"
                type="number"
                min="0"
                max="31"
                value={editingMinShifts}
                onChange={(e) =>
                  setEditingMinShifts(Number.parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label htmlFor="editMaxShifts" className="mb-1">
                {t("employees.maxShiftsPerMonth")}
              </Label>
              <Input
                id="editMaxShifts"
                type="number"
                min="0"
                max="31"
                value={editingMaxShifts}
                onChange={(e) =>
                  setEditingMaxShifts(Number.parseInt(e.target.value) || 0)
                }
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

          <div className="flex gap-2">
            <Button onClick={saveEdits} size="sm">
              {t("employees.save")}
            </Button>
            <Button onClick={cancelEdits} variant="outline" size="sm">
              {t("employees.cancel")}
            </Button>
            <Button
              onClick={() => {
                onRemoveEmployee(employee.id)
                onStopEditing()
              }}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("employees.delete")}
            </Button>
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
                  {employee.minShiftsPerMonth === employee.maxShiftsPerMonth
                    ? `${employee.minShiftsPerMonth} ${t("employees.shifts")}`
                    : `${employee.minShiftsPerMonth}-${
                        employee.maxShiftsPerMonth
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
