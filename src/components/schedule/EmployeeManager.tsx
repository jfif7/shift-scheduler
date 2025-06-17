import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { Employee } from "@/types/schedule"

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
  const [editingShifts, setEditingShifts] = useState<number>(0)

  const startEditingEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id)
    setEditingName(employee.name)
    setEditingShifts(employee.shiftsPerMonth)
  }

  const saveEmployeeEdits = () => {
    onUpdateEmployee(editingEmployee, {
      name: editingName,
      shiftsPerMonth: editingShifts,
    })
    setEditingEmployee("")
  }

  const cancelEmployeeEdits = () => {
    setEditingEmployee("")
    setEditingName("")
    setEditingShifts(0)
  }

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Manage Employees</CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasActiveSchedule
            ? "Click an employee to select and edit, then click calendar days to set preferences"
            : "Select a schedule from the history above to manage employees"}
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {!hasActiveSchedule ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No active schedule selected. Please select a schedule from the
              history above or create a new one.
            </p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No employees added yet.
            </p>
            <Button onClick={onAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Employee
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editName">Name</Label>
                          <Input
                            id="editName"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            placeholder="Employee name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editShifts">Shifts per Month</Label>
                          <Input
                            id="editShifts"
                            type="number"
                            min="1"
                            max="31"
                            value={editingShifts}
                            onChange={(e) =>
                              setEditingShifts(
                                Number.parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Tags</Label>
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
                                {tag}
                              </Button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveEmployeeEdits} size="sm">
                          Save
                        </Button>
                        <Button
                          onClick={cancelEmployeeEdits}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
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
                          Delete
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
                              {employee.shiftsPerMonth} shifts
                            </Badge>
                          </div>
                          {employee.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {employee.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {selectedEmployee === employee.id && (
                            <div className="mt-2 text-xs text-blue-600">
                              ✓ Selected - Click calendar days to set
                              preferences
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
                          Edit
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
                Add Employee
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
