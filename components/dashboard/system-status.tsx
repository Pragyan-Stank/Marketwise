"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Loader2, Activity } from "lucide-react"
import { safetyMonitorAPI } from "@/services/api"

interface SafetyProtocol {
  name: string
  status: "active" | "standby" | "alert" | "loading"
  detail: string
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <CheckCircle2 className="w-4 h-4 text-accent" />
    case "loading":
      return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
    case "alert":
      return <AlertCircle className="w-4 h-4 text-primary" />
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "text-accent"
    case "alert":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}

export function SystemStatus() {
  const [protocols, setProtocols] = useState<SafetyProtocol[]>([
    { name: "PPE Protocol", status: "loading", detail: "Checking..." },
    { name: "Hazard Zones", status: "loading", detail: "Checking..." },
    { name: "Alert Engine", status: "loading", detail: "Checking..." },
    { name: "Auto Reporting", status: "loading", detail: "Checking..." },
  ])

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const monitorStatus = await safetyMonitorAPI.getMonitorStatus()

        setProtocols([
          {
            name: "PPE Protocol",
            status: monitorStatus.active ? "active" : "standby",
            detail: monitorStatus.active ? "Active & Scanning" : "On Standby"
          },
          {
            name: "Hazard Zones",
            status: monitorStatus.active ? "active" : "standby",
            detail: "Virtual Fencing Enabled"
          },
          {
            name: "Alert Engine",
            status: "active",
            detail: "Instant Push Active"
          },
          {
            name: "Auto Reporting",
            status: "active",
            detail: "Hourly Sync Active"
          },
        ])
      } catch (error) {
        setProtocols([
          { name: "PPE Protocol", status: "standby", detail: "Connect API" },
          { name: "Hazard Zones", status: "standby", detail: "Offline" },
          { name: "Alert Engine", status: "standby", detail: "Offline" },
          { name: "Auto Reporting", status: "standby", detail: "Local only" },
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
        <CardTitle className="text-lg">Monitoring Protocols</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {protocols.map((item) => (
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
