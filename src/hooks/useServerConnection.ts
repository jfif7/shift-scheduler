/**
 * Hook for managing CP-SAT server connection status
 * 
 * This hook provides real-time status of the CP-SAT server connection,
 * including connectivity tests and server information display.
 */

import { useState, useEffect, useCallback } from "react"
import { 
  testConnection, 
  getSolverStatus, 
  checkHealth,
  getAPIConfig,
  type APISolverStatusResponse,
  type APIHealthResponse
} from "@/services/scheduleAPI"

export interface ServerStatus {
  available: boolean
  health?: APIHealthResponse
  solverStatus?: APISolverStatusResponse
  latency?: number
  error?: string
  lastChecked?: Date
}

export interface ConnectionConfig {
  baseUrl: string
  timeout: number
  configured: boolean
}

export const useServerConnection = () => {
  const [status, setStatus] = useState<ServerStatus>({ available: false })
  const [isChecking, setIsChecking] = useState(false)
  const [config] = useState<ConnectionConfig>(getAPIConfig())

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    
    try {
      // Test basic connectivity
      const connectionResult = await testConnection()
      
      if (connectionResult.available) {
        // Get detailed status
        const [health, solverStatus] = await Promise.all([
          checkHealth().catch(err => {
            console.warn("Health check failed:", err)
            return undefined
          }),
          getSolverStatus().catch(err => {
            console.warn("Solver status check failed:", err)
            return undefined
          })
        ])

        setStatus({
          available: true,
          health,
          solverStatus,
          latency: connectionResult.latency,
          lastChecked: new Date(),
        })
      } else {
        setStatus({
          available: false,
          error: connectionResult.error,
          lastChecked: new Date(),
        })
      }
    } catch (error) {
      setStatus({
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date(),
      })
    } finally {
      setIsChecking(false)
    }
  }, [])

  // Auto-check on mount and when config changes
  useEffect(() => {
    if (config.configured) {
      checkConnection()
    } else {
      setStatus({
        available: false,
        error: "API URL not configured",
        lastChecked: new Date(),
      })
    }
  }, [config.configured, checkConnection])

  const getStatusMessage = useCallback(() => {
    if (!config.configured) {
      return "Server URL not configured"
    }
    
    if (isChecking) {
      return "Checking server status..."
    }
    
    if (!status.available) {
      return status.error || "Server unavailable"
    }
    
    if (status.health && status.solverStatus) {
      const load = status.solverStatus.current_load
      const maxConcurrent = status.solverStatus.max_concurrent
      const loadPercentage = Math.round((load / maxConcurrent) * 100)
      
      return `Server healthy • ${status.latency}ms • Load: ${load}/${maxConcurrent} (${loadPercentage}%)`
    }
    
    return `Server connected • ${status.latency}ms`
  }, [config.configured, isChecking, status])

  const getStatusColor = useCallback(() => {
    if (!config.configured) return "text-yellow-600"
    if (isChecking) return "text-blue-600"
    if (!status.available) return "text-red-600"
    
    if (status.solverStatus) {
      const loadPercentage = (status.solverStatus.current_load / status.solverStatus.max_concurrent) * 100
      if (loadPercentage > 90) return "text-yellow-600"
      if (loadPercentage > 70) return "text-orange-600"
    }
    
    return "text-green-600"
  }, [config.configured, isChecking, status])

  return {
    status,
    isChecking,
    config,
    checkConnection,
    getStatusMessage,
    getStatusColor,
    isHealthy: status.available && !isChecking,
    canUseCPSAT: status.available && status.solverStatus?.available !== false,
  }
}
