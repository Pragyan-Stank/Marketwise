"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

interface ActivityItem {
  id: string
  type: "violation" | "resolution" | "system"
  message: string
  time: string
}

const recentActivity: ActivityItem[] = [
  { id: "1", type: "violation", message: "Critical violation detected", time: "2m ago" },
  { id: "2", type: "resolution", message: "Violation #1045 resolved", time: "8m ago" },
  { id: "3", type: "system", message: "System backup completed", time: "45m ago" },
  { id: "4", type: "violation", message: "PPE compliance warning", time: "1h ago" },
]

function getActivityIcon(type: string) {
  switch (type) {
    case "violation":
      return <AlertTriangle className="w-4 h-4 text-destructive" />
    case "resolution":
      return <CheckCircle2 className="w-4 h-4 text-success" />
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />
  }
}

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">{getActivityIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
