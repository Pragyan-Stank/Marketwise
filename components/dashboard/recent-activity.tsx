"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { safetyMonitorAPI, DetectionLog } from "@/services/api"

interface ActivityItem {
  id: string
  type: "violation" | "resolution" | "system"
  message: string
  time: string
}

function getActivityIcon(type: string) {
  switch (type) {
    case "violation":
      return <AlertTriangle className="w-4 h-4 text-destructive" />
    case "resolution":
      return <CheckCircle2 className="w-4 h-4 text-accent" />
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    safetyMonitorAPI.getLogs().then((data) => {
      const logs = data.logs || []
      const items: ActivityItem[] = logs.slice(0, 5).map((l: DetectionLog, idx: number) => {
        const isViolation = l.status === "VIOLATION"
        const timeStr = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        return {
          id: `act-${idx}`,
          type: isViolation ? "violation" : "resolution",
          message: isViolation
            ? `Critical: Missing ${l.missing.join(", ")}`
            : `PPE Check: All clear for Worker #${l.id}`,
          time: timeStr
        }
      })
      setActivities(items)
    }).catch(() => { })
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            activities.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
