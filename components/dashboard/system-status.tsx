"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { safetyMonitorAPI } from "@/services/api"

interface SystemItem {
  name: string
  status: "operational" | "warning" | "error" | "loading"
  detail: string
}

function getStatusIcon(status: string) {
  switch (status) {
    case "operational":
      return <CheckCircle2 className="w-4 h-4 text-success" />
    case "loading":
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
    case "error":
      return <AlertCircle className="w-4 h-4 text-primary" />
    default:
      return <AlertCircle className="w-4 h-4 text-warning" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "operational":
      return "text-success"
    case "error":
      return "text-primary"
    default:
      return "text-warning"
  }
}

export function SystemStatus() {
  const [systemItems, setSystemItems] = useState<SystemItem[]>([
    { name: "Backend Server", status: "loading", detail: "Checking connection..." },
    { name: "AI Model", status: "loading", detail: "Checking status..." },
    { name: "Video Stream", status: "loading", detail: "Checking feed..." },
    { name: "Monitoring", status: "loading", detail: "Checking status..." },
  ])

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Check if backend is reachable
        const monitorStatus = await safetyMonitorAPI.getMonitorStatus()
        const thresholdSettings = await safetyMonitorAPI.getThreshold()

        setSystemItems([
          {
            name: "Backend Server",
            status: "operational",
            detail: "FastAPI running on port 8000"
          },
          {
            name: "AI Model",
            status: "operational",
            detail: `Confidence: ${Math.round(thresholdSettings.conf * 100)}%`
          },
          {
            name: "Video Stream",
            status: "operational",
            detail: "MJPEG feed available"
          },
          {
            name: "Monitoring",
            status: monitorStatus.active ? "operational" : "warning",
            detail: monitorStatus.active ? "Detection active" : "Paused"
          },
        ])
      } catch (error) {
        // Backend not reachable - show mock/offline status
        setSystemItems([
          {
            name: "Backend Server",
            status: "warning",
            detail: "Using mock data"
          },
          {
            name: "AI Model",
            status: "operational",
            detail: "Ready (offline mode)"
          },
          {
            name: "Video Stream",
            status: "warning",
            detail: "Backend required"
          },
          {
            name: "Monitoring",
            status: "warning",
            detail: "Start backend to enable"
          },
        ])
      }
    }

    checkBackendStatus()

    // Refresh status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className={getStatusColor(item.status)}>{getStatusIcon(item.status)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
