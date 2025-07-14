import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { Employee } from "@/types/schedule"
import { useTranslations } from "next-intl"

interface EmployeeManagerProps {
  employees: Employee[]
  selectedEmployee: string
  onEmployeeSelect: (id: string) => void
  onAddEmployee: () => void
  onRemoveEmployee: (id: string) => void
  onUpdateEmployee: (id: string, updates: Partial<Employee>) => void
  onToggleTag: (employeeId: string, tag: string) => void
  predefinedTags: string[]
  hasActiveSchedule: boolean
}

export const EmployeeManager = ({
  employees,
  selectedEmployee,
  onEmployeeSelect,
  onAddEmployee,
  onRemoveEmployee,
  onUpdateEmployee,
  onToggleTag,
  predefinedTags,
  hasActiveSchedule,
}: EmployeeManagerProps) => {
  const [editingEmployee, setEditingEmployee] = useState<string>("")
  const [editingName, setEditingName] = useState<string>("")
  const [editingMinShifts, setEditingMinShifts] = useState<number>(0)
  const [editingMaxShifts, setEditingMaxShifts] = useState<number>(0)
  const t = useTranslations()

  const startEditingEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id)
    setEditingName(employee.name)
    setEditingMinShifts(employee.minShiftsPerMonth)
    setEditingMaxShifts(employee.maxShiftsPerMonth)
  }

  const saveEmployeeEdits = () => {
    // Validate that min shifts doesn't exceed max shifts
    if (editingMinShifts > editingMaxShifts) {
      // Swap them if they're in wrong order
      onUpdateEmployee(editingEmployee, {
        name: editingName,
        minShiftsPerMonth: editingMaxShifts,
        maxShiftsPerMonth: editingMinShifts,
      })
    } else {
      onUpdateEmployee(editingEmployee, {
        name: editingName,
        minShiftsPerMonth: editingMinShifts,
        maxShiftsPerMonth: editingMaxShifts,
      })
    }
    setEditingEmployee("")
  }

  const cancelEmployeeEdits = () => {
    setEditingEmployee("")
    setEditingName("")
    setEditingMinShifts(0)
    setEditingMaxShifts(0)
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{t("employees.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasActiveSchedule
            ? t("employees.selectScheduleDescription")
            : t("employees.noActiveScheduleDescription")}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {!hasActiveSchedule ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {t("employees.noActiveScheduleMessage")}
            </p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {t("employees.noEmployeesMessage")}
            </p>
            <Button onClick={onAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              {t("employees.addFirstEmployee")}
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className={`border rounded-lg transition-colors ${
                    selectedEmployee === employee.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {editingEmployee === employee.id ? (
                    // Editing mode
                    <div className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="editName">{t("employees.name")}</Label>
                        <Input
                          id="editName"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder={t("employees.namePlaceholder")}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editMinShifts">
                            {t("employees.minShiftsPerMonth")}
                          </Label>
                          <Input
                            id="editMinShifts"
                            type="number"
                            min="0"
                            max="31"
                            value={editingMinShifts}
                            onChange={(e) =>
                              setEditingMinShifts(
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editMaxShifts">
                            {t("employees.maxShiftsPerMonth")}
                          </Label>
                          <Input
                            id="editMaxShifts"
                            type="number"
                            min="0"
                            max="31"
                            value={editingMaxShifts}
                            onChange={(e) =>
                              setEditingMaxShifts(
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {t("employees.shiftsRangeNote")}
                      </p>

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
                        <Button onClick={saveEmployeeEdits} size="sm">
                          {t("employees.save")}
                        </Button>
                        <Button
                          onClick={cancelEmployeeEdits}
                          variant="outline"
                          size="sm"
                        >
                          {t("employees.cancel")}
                        </Button>
                        <Button
                          onClick={() => {
                            onRemoveEmployee(employee.id)
                            setEditingEmployee("")
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
                      onClick={() =>
                        onEmployeeSelect(
                          selectedEmployee === employee.id ? "" : employee.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{employee.name}</span>
                            <Badge variant="secondary">
                              {employee.minShiftsPerMonth ===
                              employee.maxShiftsPerMonth
                                ? `${employee.minShiftsPerMonth} ${t(
                                    "employees.shifts"
                                  )}`
                                : `${employee.minShiftsPerMonth}-${
                                    employee.maxShiftsPerMonth
                                  } ${t("employees.shifts")}`}
                            </Badge>
                          </div>
                          {employee.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {employee.tags.map((tag) => (
                                <Badge
                                  key={t(tag)}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {t(tag)}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {selectedEmployee === employee.id && (
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
                            startEditingEmployee(employee)
                          }}
                        >
                          {t("employees.edit")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasActiveSchedule && (
              <Button
                onClick={onAddEmployee}
                variant="outline"
                className="w-full mt-3 flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("employees.addEmployee")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
