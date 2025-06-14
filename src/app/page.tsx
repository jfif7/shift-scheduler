"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Trash2,
  Plus,
  Calendar,
  Settings,
  FileImage,
  FileSpreadsheet,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  id: string
  name: string
  shiftsPerMonth: number
  tags: string[]
}

interface Constraint {
  id: string
  employeeId: string
  type: "avoid" | "prefer"
  date: number
}

interface Schedule {
  [date: number]: string[] // employee IDs assigned to each date
}

export default function ScheduleManager() {
  const { toast } = useToast()
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [maxConsecutiveShifts, setMaxConsecutiveShifts] = useState<number>(3)
  const [schedule, setSchedule] = useState<Schedule>({})
  //const [newEmployeeName, setNewEmployeeName] = useState("")
  //const [newEmployeeShifts, setNewEmployeeShifts] = useState<number>(8)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")

  const [predefinedTags] = useState<string[]>([
    "Weekend type",
    "Burger",
    "Morning shift",
    "Evening shift",
    "Manager",
    "Part-time",
  ])
  const [editingEmployee, setEditingEmployee] = useState<string>("")
  const [editingName, setEditingName] = useState<string>("")
  const [editingShifts, setEditingShifts] = useState<number>(0)

  const [shiftsPerDay, setShiftsPerDay] = useState<number>(1)
  const [personsPerShift, setPersonsPerShift] = useState<number>(1)
  const [minRestDaysBetweenShifts, setMinRestDaysBetweenShifts] =
    useState<number>(0)
  const [weekendCoverageRequired, setWeekendCoverageRequired] =
    useState<boolean>(true)
  const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState<number>(5)
  const [minShiftsPerWeek, setMinShiftsPerWeek] = useState<number>(1)
  const [evenDistribution, setEvenDistribution] = useState<boolean>(true)

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString())
    setSelectedYear(now.getFullYear().toString())
    loadFromLocalStorage()
  }, [])

  const saveToLocalStorage = () => {
    const data = {
      employees,
      constraints,
      schedule,
      selectedMonth,
      selectedYear,
      maxConsecutiveShifts,
      shiftsPerDay,
      personsPerShift,
      minRestDaysBetweenShifts,
      weekendCoverageRequired,
      maxShiftsPerWeek,
      minShiftsPerWeek,
      evenDistribution,
    }
    localStorage.setItem("scheduleData", JSON.stringify(data))
  }

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToLocalStorage()
  }, [
    employees,
    constraints,
    schedule,
    selectedMonth,
    selectedYear,
    maxConsecutiveShifts,
    shiftsPerDay,
    personsPerShift,
    minRestDaysBetweenShifts,
    weekendCoverageRequired,
    maxShiftsPerWeek,
    minShiftsPerWeek,
    evenDistribution,
  ])

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem("scheduleData")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setEmployees(
          (data.employees || []).map((emp: any) => ({
            ...emp,
            tags: emp.tags || [],
          }))
        )
        setConstraints(data.constraints || [])
        setSchedule(data.schedule || {})
        setMaxConsecutiveShifts(data.maxConsecutiveShifts || 3)
        setShiftsPerDay(data.shiftsPerDay || 1)
        setPersonsPerShift(data.personsPerShift || 1)
        setMinRestDaysBetweenShifts(data.minRestDaysBetweenShifts || 0)
        setWeekendCoverageRequired(data.weekendCoverageRequired ?? true)
        setMaxShiftsPerWeek(data.maxShiftsPerWeek || 5)
        setMinShiftsPerWeek(data.minShiftsPerWeek || 1)
        setEvenDistribution(data.evenDistribution ?? true)
        if (data.selectedMonth) setSelectedMonth(data.selectedMonth)
        if (data.selectedYear) setSelectedYear(data.selectedYear)
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
    }
  }

  const getDaysInMonth = () => {
    if (!selectedMonth || !selectedYear) return 0
    return new Date(
      Number.parseInt(selectedYear),
      Number.parseInt(selectedMonth),
      0
    ).getDate()
  }

  const getMonthName = () => {
    if (!selectedMonth) return ""
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return monthNames[Number.parseInt(selectedMonth) - 1]
  }

  const addEmployee = () => {
    const existingNumbers = employees
      .filter((emp) => emp.name.startsWith("New Employee "))
      .map((emp) => {
        const match = emp.name.match(/New Employee (\d+)/)
        return match ? Number.parseInt(match[1]) : 0
      })

    const nextNumber =
      existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    const paddedNumber = nextNumber.toString().padStart(3, "0")

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: `New Employee ${paddedNumber}`,
      shiftsPerMonth: 8,
      tags: [],
    }

    setEmployees([...employees, newEmployee])
    toast({
      title: "Employee added",
      description: `${newEmployee.name} has been added to the schedule.`,
    })
  }

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
    setConstraints(
      constraints.filter((constraint) => constraint.employeeId !== id)
    )
    // Remove from schedule
    const newSchedule = { ...schedule }
    Object.keys(newSchedule).forEach((date) => {
      newSchedule[Number.parseInt(date)] = newSchedule[
        Number.parseInt(date)
      ].filter((empId) => empId !== id)
    })
    setSchedule(newSchedule)
  }

  const addConstraint = (
    employeeId: string,
    type: "avoid" | "prefer",
    date: number
  ) => {
    const newConstraint: Constraint = {
      id: Date.now().toString(),
      employeeId,
      type,
      date,
    }
    setConstraints([...constraints, newConstraint])
  }

  const removeConstraint = (id: string) => {
    setConstraints(constraints.filter((constraint) => constraint.id !== id))
  }

  const generateSchedule = () => {
    if (employees.length === 0) {
      toast({
        title: "No employees",
        description: "Please add employees before generating a schedule.",
        variant: "destructive",
      })
      return
    }

    const daysInMonth = getDaysInMonth()
    const newSchedule: Schedule = {}

    // Initialize empty schedule
    for (let day = 1; day <= daysInMonth; day++) {
      newSchedule[day] = []
    }

    // Calculate total shifts needed and available
    const totalShiftsNeeded = daysInMonth * shiftsPerDay * personsPerShift
    const totalShiftsAvailable = employees.reduce(
      (sum, emp) => sum + emp.shiftsPerMonth,
      0
    )

    if (totalShiftsAvailable < totalShiftsNeeded) {
      toast({
        title: "Insufficient shifts",
        description: `Need ${totalShiftsNeeded} total shifts, but only ${totalShiftsAvailable} available.`,
        variant: "destructive",
      })
      return
    }

    // Create employee shift tracking
    const employeeShiftsRemaining = employees.reduce((acc, emp) => {
      acc[emp.id] = emp.shiftsPerMonth
      return acc
    }, {} as Record<string, number>)

    // Track consecutive shifts and weekly shifts for each employee
    const consecutiveShifts = employees.reduce((acc, emp) => {
      acc[emp.id] = 0
      return acc
    }, {} as Record<string, number>)

    const weeklyShifts = employees.reduce((acc, emp) => {
      acc[emp.id] = 0
      return acc
    }, {} as Record<string, number>)

    // Generate schedule day by day
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = new Date(
        Number.parseInt(selectedYear),
        Number.parseInt(selectedMonth) - 1,
        day
      ).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday

      // Reset weekly counters on Monday (dayOfWeek === 1)
      if (dayOfWeek === 1) {
        Object.keys(weeklyShifts).forEach((empId) => {
          weeklyShifts[empId] = 0
        })
      }

      // For each shift in the day
      for (let shift = 0; shift < shiftsPerDay; shift++) {
        // For each person needed in this shift
        for (let person = 0; person < personsPerShift; person++) {
          const availableEmployees = employees.filter((emp) => {
            // Check if employee has shifts remaining
            if (employeeShiftsRemaining[emp.id] <= 0) return false

            // Check avoid constraints
            const hasAvoidConstraint = constraints.some(
              (constraint) =>
                constraint.employeeId === emp.id &&
                constraint.type === "avoid" &&
                constraint.date === day
            )
            if (hasAvoidConstraint) return false

            // Check consecutive shifts limit
            if (consecutiveShifts[emp.id] >= maxConsecutiveShifts) return false

            // Check weekly limits
            if (weeklyShifts[emp.id] >= maxShiftsPerWeek) return false

            // Check if already assigned to this day
            if (newSchedule[day].includes(emp.id)) return false

            // Weekend coverage check
            if (
              isWeekend &&
              weekendCoverageRequired &&
              emp.tags.includes("Weekend type")
            ) {
              return true // Prioritize weekend workers
            }

            return true
          })

          if (availableEmployees.length === 0) {
            // If no one is available, try to assign someone anyway (relaxing some constraints)
            const fallbackEmployees = employees.filter(
              (emp) =>
                employeeShiftsRemaining[emp.id] > 0 &&
                !constraints.some(
                  (c) =>
                    c.employeeId === emp.id &&
                    c.type === "avoid" &&
                    c.date === day
                ) &&
                !newSchedule[day].includes(emp.id)
            )
            if (fallbackEmployees.length > 0) {
              const selectedEmployee = fallbackEmployees[0]
              newSchedule[day].push(selectedEmployee.id)
              employeeShiftsRemaining[selectedEmployee.id]--
              consecutiveShifts[selectedEmployee.id]++
              weeklyShifts[selectedEmployee.id]++
            }
          } else {
            // Prioritize employees with prefer constraints
            const preferredEmployees = availableEmployees.filter((emp) =>
              constraints.some(
                (c) =>
                  c.employeeId === emp.id &&
                  c.type === "prefer" &&
                  c.date === day
              )
            )

            // For weekend, prioritize weekend workers
            const weekendWorkers = isWeekend
              ? availableEmployees.filter((emp) =>
                  emp.tags.includes("Weekend type")
                )
              : []

            let candidateEmployees = availableEmployees
            if (preferredEmployees.length > 0) {
              candidateEmployees = preferredEmployees
            } else if (weekendWorkers.length > 0 && isWeekend) {
              candidateEmployees = weekendWorkers
            }

            // Select employee with most remaining shifts (to balance workload) if even distribution is enabled
            const selectedEmployee = evenDistribution
              ? candidateEmployees.reduce((prev, current) =>
                  employeeShiftsRemaining[current.id] >
                  employeeShiftsRemaining[prev.id]
                    ? current
                    : prev
                )
              : candidateEmployees[
                  Math.floor(Math.random() * candidateEmployees.length)
                ]

            newSchedule[day].push(selectedEmployee.id)
            employeeShiftsRemaining[selectedEmployee.id]--
            consecutiveShifts[selectedEmployee.id]++
            weeklyShifts[selectedEmployee.id]++
          }
        }
      }
    }

    // Reset consecutive counter for employees not working today
    employees.forEach((emp) => {
      const dayOfWeek = new Date(
        Number.parseInt(selectedYear),
        Number.parseInt(selectedMonth) - 1,
        day
      ).getDay()
      if (!newSchedule[day].includes(emp.id)) {
        consecutiveShifts[emp.id] = 0
      }
    })

    setSchedule(newSchedule)
    toast({
      title: "Schedule generated",
      description: "New schedule has been created based on your constraints.",
    })
  }

  const exportAsCSV = () => {
    if (Object.keys(schedule).length === 0) {
      toast({
        title: "No schedule",
        description: "Please generate a schedule first.",
        variant: "destructive",
      })
      return
    }

    const daysInMonth = getDaysInMonth()
    let csvContent = "Date,Employee\n"

    for (let day = 1; day <= daysInMonth; day++) {
      const assignedEmployees = schedule[day] || []
      if (assignedEmployees.length > 0) {
        assignedEmployees.forEach((empId) => {
          const employee = employees.find((emp) => emp.id === empId)
          csvContent += `${selectedYear}-${selectedMonth.padStart(2, "0")}-${day
            .toString()
            .padStart(2, "0")},${employee?.name || "Unknown"}\n`
        })
      } else {
        csvContent += `${selectedYear}-${selectedMonth.padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")},No Assignment\n`
      }
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `schedule-${getMonthName()}-${selectedYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "CSV exported",
      description: "Schedule has been exported as CSV file.",
    })
  }

  const exportAsImage = () => {
    if (Object.keys(schedule).length === 0) {
      toast({
        title: "No schedule",
        description: "Please generate a schedule first.",
        variant: "destructive",
      })
      return
    }

    // Create a canvas to draw the schedule
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const daysInMonth = getDaysInMonth()
    const cellWidth = 120
    const cellHeight = 40
    const headerHeight = 60

    canvas.width = Math.max(800, cellWidth * 7) // At least 800px wide
    canvas.height = headerHeight + Math.ceil(daysInMonth / 7) * cellHeight

    // Set background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.fillStyle = "#000000"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText(
      `${getMonthName()} ${selectedYear} Schedule`,
      canvas.width / 2,
      30
    )

    // Draw calendar grid
    ctx.font = "14px Arial"
    ctx.textAlign = "left"

    for (let day = 1; day <= daysInMonth; day++) {
      const row = Math.floor((day - 1) / 7)
      const col = (day - 1) % 7
      const x = col * cellWidth
      const y = headerHeight + row * cellHeight

      // Draw cell border
      ctx.strokeStyle = "#cccccc"
      ctx.strokeRect(x, y, cellWidth, cellHeight)

      // Draw day number
      ctx.fillStyle = "#000000"
      ctx.fillText(day.toString(), x + 5, y + 20)

      // Draw assigned employee
      const assignedEmployees = schedule[day] || []
      if (assignedEmployees.length > 0) {
        const employee = employees.find(
          (emp) => emp.id === assignedEmployees[0]
        )
        ctx.fillStyle = "#0066cc"
        ctx.fillText(employee?.name || "Unknown", x + 5, y + 35)
      }
    }

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `schedule-${getMonthName()}-${selectedYear}.png`
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Image exported",
          description: "Schedule has been exported as PNG image.",
        })
      }
    })
  }

  const startEditingEmployee = (employee: Employee) => {
    setEditingEmployee(employee.id)
    setEditingName(employee.name)
    setEditingShifts(employee.shiftsPerMonth)
  }

  const saveEmployeeEdits = () => {
    setEmployees(
      employees.map((emp) =>
        emp.id === editingEmployee
          ? { ...emp, name: editingName, shiftsPerMonth: editingShifts }
          : emp
      )
    )
    setEditingEmployee("")
    toast({
      title: "Employee updated",
      description: "Employee information has been saved.",
    })
  }

  const cancelEmployeeEdits = () => {
    setEditingEmployee("")
    setEditingName("")
    setEditingShifts(0)
  }

  const toggleEmployeeTag = (employeeId: string, tag: string) => {
    setEmployees(
      employees.map((emp) => {
        if (emp.id === employeeId) {
          const hasTag = emp.tags.includes(tag)
          return {
            ...emp,
            tags: hasTag
              ? emp.tags.filter((t) => t !== tag)
              : [...emp.tags, tag],
          }
        }
        return emp
      })
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schedule Manager</h1>
        <p className="text-muted-foreground">
          Manage employee schedules with constraints and preferences
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="constraints" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Constraints
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Month Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Month Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2024, i, 1).toLocaleString("default", {
                              month: "long",
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => (
                          <SelectItem
                            key={2024 + i}
                            value={(2024 + i).toString()}
                          >
                            {2024 + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedMonth && selectedYear && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Selected:{" "}
                      <strong>
                        {getMonthName()} {selectedYear}
                      </strong>{" "}
                      ({getDaysInMonth()} days)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employee Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Employees</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click an employee to select and edit, then click calendar days
                  to set preferences
                </p>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No employees added yet.
                    </p>
                    <Button onClick={addEmployee}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Employee
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                                  onChange={(e) =>
                                    setEditingName(e.target.value)
                                  }
                                  placeholder="Employee name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="editShifts">
                                  Shifts per Month
                                </Label>
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
                                      onClick={() =>
                                        toggleEmployeeTag(employee.id, tag)
                                      }
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
                                  removeEmployee(employee.id)
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
                              setSelectedEmployee(
                                selectedEmployee === employee.id
                                  ? ""
                                  : employee.id
                              )
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {employee.name}
                                  </span>
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

                    <Button
                      onClick={addEmployee}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                )}

                {selectedEmployee && !editingEmployee && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Legend:
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
                        <span>Preferred days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
                        <span>Avoid days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                        <span>Normal days</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMonth && selectedYear
                    ? `${getMonthName()} ${selectedYear}`
                    : "Calendar"}
                </CardTitle>
                {selectedEmployee && (
                  <p className="text-sm text-muted-foreground">
                    Setting preferences for:{" "}
                    <strong>
                      {
                        employees.find((emp) => emp.id === selectedEmployee)
                          ?.name
                      }
                    </strong>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {!selectedMonth || !selectedYear ? (
                  <p className="text-muted-foreground">
                    Select a month and year to view calendar
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-7 gap-1">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div
                          key={index}
                          className="p-2 text-center text-xs font-medium text-muted-foreground"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const firstDay = new Date(
                          Number.parseInt(selectedYear),
                          Number.parseInt(selectedMonth) - 1,
                          1
                        ).getDay()
                        const daysInMonth = getDaysInMonth()
                        const cells = []

                        // Empty cells for days before month starts
                        for (let i = 0; i < firstDay; i++) {
                          cells.push(
                            <div key={`empty-${i}`} className="p-2 h-8"></div>
                          )
                        }

                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const preferConstraint = constraints.find(
                            (c) =>
                              c.employeeId === selectedEmployee &&
                              c.type === "prefer" &&
                              c.date === day
                          )
                          const avoidConstraint = constraints.find(
                            (c) =>
                              c.employeeId === selectedEmployee &&
                              c.type === "avoid" &&
                              c.date === day
                          )

                          let cellClass =
                            "p-1 h-8 text-xs border rounded cursor-pointer transition-colors flex items-center justify-center "

                          if (!selectedEmployee) {
                            cellClass += "border-gray-200 hover:border-gray-300"
                          } else if (preferConstraint) {
                            cellClass +=
                              "bg-green-200 border-green-400 text-green-800 hover:bg-green-300"
                          } else if (avoidConstraint) {
                            cellClass +=
                              "bg-red-200 border-red-400 text-red-800 hover:bg-red-300"
                          } else {
                            cellClass +=
                              "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                          }

                          cells.push(
                            <div
                              key={day}
                              className={cellClass}
                              onClick={() => {
                                if (!selectedEmployee) return

                                // Cycle through: normal -> prefer -> avoid -> normal
                                if (preferConstraint) {
                                  // Currently prefer, change to avoid
                                  removeConstraint(preferConstraint.id)
                                  addConstraint(selectedEmployee, "avoid", day)
                                } else if (avoidConstraint) {
                                  // Currently avoid, change to normal
                                  removeConstraint(avoidConstraint.id)
                                } else {
                                  // Currently normal, change to prefer
                                  addConstraint(selectedEmployee, "prefer", day)
                                }
                              }}
                            >
                              {day}
                            </div>
                          )
                        }

                        return cells
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="constraints">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Scheduling Constraints</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure global rules that apply to the entire schedule
                  generation process
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
                      value={shiftsPerDay}
                      onChange={(e) =>
                        setShiftsPerDay(Number.parseInt(e.target.value) || 1)
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
                      value={personsPerShift}
                      onChange={(e) =>
                        setPersonsPerShift(Number.parseInt(e.target.value) || 1)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of people needed for each shift
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxConsecutive">
                      Max Consecutive Shifts
                    </Label>
                    <Input
                      id="maxConsecutive"
                      type="number"
                      min="1"
                      max="7"
                      value={maxConsecutiveShifts}
                      onChange={(e) =>
                        setMaxConsecutiveShifts(
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
                  <h3 className="text-lg font-medium mb-4">
                    Rest and Recovery
                  </h3>
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
                        value={minRestDaysBetweenShifts}
                        onChange={(e) =>
                          setMinRestDaysBetweenShifts(
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
                          checked={weekendCoverageRequired}
                          onChange={(e) =>
                            setWeekendCoverageRequired(e.target.checked)
                          }
                          className="rounded"
                        />
                        Weekend Coverage Required
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ensure shifts are covered on weekends (Saturday &
                        Sunday)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weekly Limits */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Weekly Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minShiftsPerWeek">
                        Minimum Shifts per Week
                      </Label>
                      <Input
                        id="minShiftsPerWeek"
                        type="number"
                        min="0"
                        max="7"
                        value={minShiftsPerWeek}
                        onChange={(e) =>
                          setMinShiftsPerWeek(
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum shifts each employee should work per week
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxShiftsPerWeek">
                        Maximum Shifts per Week
                      </Label>
                      <Input
                        id="maxShiftsPerWeek"
                        type="number"
                        min="1"
                        max="7"
                        value={maxShiftsPerWeek}
                        onChange={(e) =>
                          setMaxShiftsPerWeek(
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
                          checked={evenDistribution}
                          onChange={(e) =>
                            setEvenDistribution(e.target.checked)
                          }
                          className="rounded"
                        />
                        Even Shift Distribution
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Attempt to distribute shifts evenly among all employees
                        to ensure fairness
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t pt-6 bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">
                    Constraint Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Daily:</strong> {shiftsPerDay} shift(s),{" "}
                        {personsPerShift} person(s) each
                      </p>
                      <p>
                        <strong>Consecutive:</strong> Max {maxConsecutiveShifts}{" "}
                        shifts in a row
                      </p>
                      <p>
                        <strong>Rest:</strong> {minRestDaysBetweenShifts} day(s)
                        minimum between shifts
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Weekly:</strong> {minShiftsPerWeek}-
                        {maxShiftsPerWeek} shifts per person
                      </p>
                      <p>
                        <strong>Weekend:</strong>{" "}
                        {weekendCoverageRequired ? "Required" : "Optional"}
                      </p>
                      <p>
                        <strong>Distribution:</strong>{" "}
                        {evenDistribution ? "Even" : "Flexible"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Individual Employee Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  For individual employee preferences (preferred/avoided days),
                  use the Setup tab&apos;s calendar interface
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Individual employee preferences can be set more intuitively
                    in the Setup tab
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Switch to setup tab
                      const setupTab = document.querySelector(
                        '[value="setup"]'
                      ) as HTMLElement
                      setupTab?.click()
                    }}
                  >
                    Go to Setup Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Schedule Generation
                  <div className="flex gap-2">
                    <Button
                      onClick={generateSchedule}
                      disabled={employees.length === 0}
                    >
                      Generate Schedule
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportAsCSV}
                      disabled={Object.keys(schedule).length === 0}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={exportAsImage}
                      disabled={Object.keys(schedule).length === 0}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Export Image
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(schedule).length === 0 ? (
                  <p className="text-muted-foreground">
                    No schedule generated yet. Click &quot;Generate
                    Schedule&quot; to create one.
                  </p>
                ) : (
                  <div>
                    <h3 className="font-medium mb-4">
                      {getMonthName()} {selectedYear} Schedule
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-2 text-center font-medium bg-muted rounded"
                          >
                            {day}
                          </div>
                        )
                      )}

                      {/* Calculate starting day of week */}
                      {selectedMonth &&
                        selectedYear &&
                        (() => {
                          const firstDay = new Date(
                            Number.parseInt(selectedYear),
                            Number.parseInt(selectedMonth) - 1,
                            1
                          ).getDay()
                          const daysInMonth = getDaysInMonth()
                          const cells = []

                          // Empty cells for days before month starts
                          for (let i = 0; i < firstDay; i++) {
                            cells.push(
                              <div
                                key={`empty-${i}`}
                                className="p-2 h-16"
                              ></div>
                            )
                          }

                          // Days of the month
                          for (let day = 1; day <= daysInMonth; day++) {
                            const assignedEmployees = schedule[day] || []
                            cells.push(
                              <div
                                key={day}
                                className="p-2 h-16 border rounded-lg"
                              >
                                <div className="text-sm font-medium">{day}</div>
                                {assignedEmployees.map((empId) => {
                                  const employee = employees.find(
                                    (emp) => emp.id === empId
                                  )
                                  return (
                                    <div
                                      key={empId}
                                      className="text-xs text-blue-600 truncate"
                                    >
                                      {employee?.name}
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          }

                          return cells
                        })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
