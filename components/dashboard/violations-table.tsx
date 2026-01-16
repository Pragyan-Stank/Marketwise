"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"
import { dashboardAPI } from "@/services/api"

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
      return "bg-primary/10 border-primary/20"
    case "warning":
      return "bg-warning/10 border-warning/20"
    default:
      return "bg-info/10 border-info/20"
  }
}

export function ViolationsTable() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getViolations(5).then((data) => {
      let violationsList: Violation[] = []

      // If data is an array, use it directly
      if (Array.isArray(data)) {
        violationsList = data
      }
      // If data is an object with a violations property, use that
      else if (data && data.violations) {
        violationsList = data.violations
      }

      setViolations(violationsList)
      setLoading(false)
    })
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
