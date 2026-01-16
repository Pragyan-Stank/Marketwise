"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Info, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logsAPI } from "@/services/api"

interface Log {
  id: string
  timestamp: string
  type: string
  severity: "critical" | "warning" | "info"
  camera: string
  description: string
  confidence: number
  person?: string
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

function getSeverityBadgeColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-primary/20 text-primary border-primary/30"
    case "warning":
      return "bg-warning/20 text-warning border-warning/30"
    default:
      return "bg-info/20 text-info border-info/30"
  }
}

interface LogsTableProps {
  filters: {
    severity: string
    type: string
    camera: string
    dateRange: string
  }
}

export function LogsTable({ filters }: LogsTableProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    logsAPI
      .getLogs({
        severity: filters.severity !== "all" ? filters.severity : undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        camera: filters.camera !== "all" ? filters.camera : undefined,
      })
      .then((data) => {
        setLogs(data.logs || [])
        setLoading(false)
      })
  }, [filters])

  const filteredLogs = logs.filter((log) => {
    if (filters.severity !== "all" && log.severity !== filters.severity) return false
    if (filters.type !== "all" && !log.type.toLowerCase().includes(filters.type.toLowerCase())) return false
    if (filters.camera !== "all" && !log.camera.includes(filters.camera)) return false
    return true
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Detection History</CardTitle>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Camera</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Confidence</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4 text-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{log.type}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(log.severity)}
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityBadgeColor(log.severity)}`}
                      >
                        {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{log.camera}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      {Math.round(log.confidence * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">Showing {filteredLogs.length} entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
