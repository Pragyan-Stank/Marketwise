"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { safetyMonitorAPI, DetectionLog } from "@/services/api"

interface Violation {
  id: string
  type: string
  severity: "critical" | "warning" | "info"
  camera: string
  timestamp: string
  person: string
  confidence: number
  description: string
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="w-4 h-4 text-primary" />
    case "warning":
      return <AlertCircle className="w-4 h-4 text-warning" />
    default:
      return <Info className="w-4 h-4 text-info" />
  }
}

function getSeverityBg(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-primary/5 border-primary/20"
    case "warning":
      return "bg-orange-500/5 border-orange-500/20"
    default:
      return "bg-blue-500/5 border-blue-500/20"
  }
}

export function ViolationsTable() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    safetyMonitorAPI.getLogs().then((data) => {
      const logs = data.logs || []
      const violationsList: Violation[] = logs
        .filter((l: DetectionLog) => l.status === "VIOLATION")
        .slice(0, 5)
        .map((l: DetectionLog) => {
          const missingCount = l.missing.length
          const severity = missingCount >= 2 ? "critical" : "warning"
          const type = l.missing[0] ? l.missing[0].split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "PPE"

          return {
            id: `db-${l.id}-${l.timestamp}`,
            type: type,
            severity: severity as "critical" | "warning",
            camera: l.source || "Camera 1",
            timestamp: l.timestamp,
            person: `Worker #${l.id}`,
            confidence: 95,
            description: missingCount > 0 ? `Missing ${l.missing.join(", ")}` : "PPE Violation"
          }
        })

      setViolations(violationsList)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Violations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {violations.map((violation) => (
            <div
              key={violation.id}
              className={`flex items-center gap-4 p-4 rounded-lg border ${getSeverityBg(violation.severity)}`}
            >
              <div className="flex-shrink-0">{getSeverityIcon(violation.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground">{violation.description}</p>
                  <span className="text-xs px-2 py-1 bg-background/50 rounded text-muted-foreground">
                    {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {violation.camera} • {violation.person}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{new Date(violation.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
