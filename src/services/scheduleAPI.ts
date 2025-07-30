/**
 * Schedule API Service - Interface with CP-SAT server
 *
 * This service provides integration with the FastAPI CP-SAT scheduler server.
 * It includes proper error handling, timeout management, and fallback mechanisms.
 */

import {
  Employee,
  Constraint,
  Schedule,
  ScheduleSettings,
} from "@/types/schedule"

// API Types matching server models
export interface APIEmployee {
  id: string
  name: string
  shifts_per_month: [number, number]
  weekday_shifts: [number, number]
  weekend_shifts: [number, number]
  tags: string[]
}

export interface APIConstraint {
  id: string
  employee_id: string
  type: "avoid" | "prefer"
  date: number
  shift_index: number
}

export interface APIScheduleSettings {
  shifts_per_day: number
  persons_per_shift: number[]
  max_consecutive_shifts: number
  max_consecutive_days: number
  min_rest_days_between_shifts: number
  prevent_multiple_shifts_per_day: boolean
  max_shifts_per_week: number
  min_shifts_per_week: number
  even_distribution: boolean
  // Advanced optimization settings
  fairness_weight?: number
  preference_weight?: number
  optimize_for?: "balanced" | "minimal_cost" | "max_coverage"
}

export interface APIScheduleRequest {
  employees: APIEmployee[]
  constraints: APIConstraint[]
  settings: APIScheduleSettings
  selected_month: number
  selected_year: number
  timeout?: number
}

export interface APIShiftAssignment {
  employee_ids: string[]
}

export interface APIDaySchedule {
  shifts: APIShiftAssignment[]
}

export interface APISchedule {
  days: Record<number, APIDaySchedule>
}

export interface APISolverMetadata {
  solver_status: string
  solve_time: number
  objective_value: number
  constraints_satisfied: boolean
  algorithm: string
}

export interface APIScheduleResponse {
  success: boolean
  schedule: APISchedule
  metadata: APISolverMetadata
  message: string
}

export interface APIHealthResponse {
  status: string
  timestamp: string
  version: string
}

export interface APISolverStatusResponse {
  available: boolean
  current_load: number
  max_concurrent: number
  solver_version: string
}

// Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_SCHEDULER_API_URL ||
  (() => {
    throw new Error(
      "NEXT_PUBLIC_SCHEDULER_API_URL environment variable is not set. "
    )
  })()
const DEFAULT_TIMEOUT = 30000 // 30 seconds

// Error types
export class ScheduleAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message)
    this.name = "ScheduleAPIError"
  }
}

export class ScheduleTimeoutError extends ScheduleAPIError {
  constructor(timeout: number) {
    super(`Schedule generation timed out after ${timeout / 1000} seconds`)
    this.name = "ScheduleTimeoutError"
  }
}

export class ScheduleServerError extends ScheduleAPIError {
  constructor(message: string, status: number) {
    super(`Server error: ${message}`)
    this.status = status
    this.name = "ScheduleServerError"
  }
}

function convertToAPIEmployee(employee: Employee): APIEmployee {
  return {
    id: employee.id,
    name: employee.name,
    shifts_per_month: employee.shiftsPerMonth,
    weekday_shifts: employee.weekdayShifts,
    weekend_shifts: employee.weekendShifts,
    tags: employee.tags,
  }
}

function convertToAPIConstraint(constraint: Constraint): APIConstraint {
  return {
    id: constraint.id,
    employee_id: constraint.employeeId,
    type: constraint.type,
    date: constraint.date,
    shift_index: constraint.shiftIndex,
  }
}

function convertToAPISettings(settings: ScheduleSettings): APIScheduleSettings {
  return {
    shifts_per_day: settings.shiftsPerDay,
    persons_per_shift: settings.personsPerShift,
    max_consecutive_shifts: settings.maxConsecutiveShifts,
    max_consecutive_days: settings.maxConsecutiveDays,
    min_rest_days_between_shifts: settings.minRestDaysBetweenShifts,
    prevent_multiple_shifts_per_day: settings.preventMultipleShiftsPerDay,
    max_shifts_per_week: settings.maxShiftsPerWeek,
    min_shifts_per_week: settings.minShiftsPerWeek,
    even_distribution: settings.evenDistribution,
    // Advanced optimization defaults
    fairness_weight: 2,
    preference_weight: 100,
    optimize_for: "balanced",
  }
}

function convertFromAPISchedule(apiSchedule: APISchedule): Schedule {
  const schedule: Schedule = {}

  for (const [dateStr, daySchedule] of Object.entries(apiSchedule.days)) {
    const date = parseInt(dateStr)
    schedule[date] = {
      shifts: daySchedule.shifts.map((shift) => ({
        employeeIds: shift.employee_ids,
      })),
    }
  }

  return schedule
}

/**
 * Make HTTP request with timeout and error handling
 */
async function makeRequest<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail)
            ? errorData.detail
                .map((d: { msg?: string } | string) =>
                  typeof d === "object" && d.msg ? d.msg : String(d)
                )
                .join(", ")
            : errorData.detail
        }
      } catch {
        // Ignore JSON parsing errors for error responses
      }
      throw new ScheduleServerError(errorMessage, response.status)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ScheduleTimeoutError(timeoutMs)
    }

    if (error instanceof ScheduleAPIError) {
      throw error
    }

    throw new ScheduleAPIError(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<APIHealthResponse> {
  return makeRequest<APIHealthResponse>(`${API_BASE_URL}/health`, {
    method: "GET",
  })
}

/**
 * Get solver status
 */
export async function getSolverStatus(): Promise<APISolverStatusResponse> {
  return makeRequest<APISolverStatusResponse>(
    `${API_BASE_URL}/api/v1/solver/status`,
    {
      method: "GET",
    }
  )
}

/**
 * Generate schedule using CP-SAT solver
 */
export async function generateScheduleWithCPSAT(
  employees: Employee[],
  constraints: Constraint[],
  settings: ScheduleSettings,
  selectedMonth: number,
  selectedYear: number,
  timeout: number = 30
): Promise<{
  schedule: Schedule
  success: boolean
  message: string
  metadata?: APISolverMetadata
}> {
  // Convert frontend types to API types
  const request: APIScheduleRequest = {
    employees: employees.map(convertToAPIEmployee),
    constraints: constraints.map(convertToAPIConstraint),
    settings: convertToAPISettings(settings),
    selected_month: selectedMonth,
    selected_year: selectedYear,
    timeout,
  }

  // Make API request
  const response = await makeRequest<APIScheduleResponse>(
    `${API_BASE_URL}/api/v1/schedule/generate`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    (timeout + 5) * 1000 // Add 5 seconds buffer to HTTP timeout
  )

  // Convert API response back to frontend types
  return {
    schedule: convertFromAPISchedule(response.schedule),
    success: response.success,
    message: response.message,
    metadata: response.metadata,
  }
}

/**
 * Test server connectivity
 */
export async function testConnection(): Promise<{
  available: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    await checkHealth()
    const latency = Date.now() - startTime
    return { available: true, latency }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get API configuration status
 */
export function getAPIConfig() {
  return {
    baseUrl: API_BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    configured: !!process.env.NEXT_PUBLIC_SCHEDULER_API_URL,
  }
}
