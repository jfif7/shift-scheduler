/**
 * Server Status Component
 * 
 * Displays the current status of the CP-SAT scheduler server,
 * including connectivity, health, and performance metrics.
 */

import React from "react"
import { useServerConnection } from "@/hooks/useServerConnection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Server, Zap, Clock, Users } from "lucide-react"

interface ServerStatusProps {
  showDetails?: boolean
  className?: string
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ 
  showDetails = false,
  className = ""
}) => {
  const {
    status,
    isChecking,
    config,
    checkConnection,
    getStatusMessage,
    getStatusColor,
    isHealthy,
    canUseCPSAT
  } = useServerConnection()

  if (!showDetails) {
    // Compact status for toolbar/header
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Server className="h-4 w-4" />
          <span className="text-sm font-medium">CP-SAT</span>
        </div>
        <Badge 
          variant={isHealthy ? "default" : "destructive"}
          className="text-xs"
        >
          {isHealthy ? "Connected" : "Offline"}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          disabled={isChecking}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
        </Button>
      </div>
    )
  }

  // Detailed status card
  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <h3 className="font-semibold">CP-SAT Scheduler Server</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Status Overview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isHealthy ? "default" : "destructive"}
              className="text-xs"
            >
              {isHealthy ? "Healthy" : "Unavailable"}
            </Badge>
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>

          {/* Configuration info */}
          <div className="text-xs text-gray-500">
            <div>Endpoint: {config.baseUrl}</div>
            <div>Timeout: {config.timeout / 1000}s</div>
            {status.lastChecked && (
              <div>Last checked: {status.lastChecked.toLocaleTimeString()}</div>
            )}
          </div>
        </div>

        {/* Detailed metrics (when server is available) */}
        {isHealthy && status.solverStatus && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4" />
                <span>Performance</span>
              </div>
              <div className="text-xs space-y-1">
                <div>Latency: {status.latency}ms</div>
                <div>Version: {status.solverStatus.solver_version}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Load</span>
              </div>
              <div className="text-xs space-y-1">
                <div>
                  Active: {status.solverStatus.current_load} / {status.solverStatus.max_concurrent}
                </div>
                <div>
                  Capacity: {Math.round((1 - status.solverStatus.current_load / status.solverStatus.max_concurrent) * 100)}% free
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm availability notice */}
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          {canUseCPSAT ? (
            <div className="flex items-center gap-2 text-green-700">
              <Zap className="h-3 w-3" />
              CP-SAT solver available - will be used automatically for optimal scheduling
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-700">
              <Clock className="h-3 w-3" />
              CP-SAT unavailable - falling back to local genetic/simulated annealing algorithms
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
