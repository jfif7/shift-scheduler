import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Employee } from "@/types/schedule"
import { useTranslations } from "next-intl"
import { EmployeeCard } from "./EmployeeCard"

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
  const t = useTranslations()

  const handleStartEditing = (employee: Employee) => {
    setEditingEmployee(employee.id)
  }

  const handleStopEditing = () => {
    setEditingEmployee("")
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
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  isSelected={selectedEmployee === employee.id}
                  isEditing={editingEmployee === employee.id}
                  predefinedTags={predefinedTags}
                  onEmployeeSelect={onEmployeeSelect}
                  onRemoveEmployee={onRemoveEmployee}
                  onUpdateEmployee={onUpdateEmployee}
                  onToggleTag={onToggleTag}
                  onStartEditing={handleStartEditing}
                  onStopEditing={handleStopEditing}
                />
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
