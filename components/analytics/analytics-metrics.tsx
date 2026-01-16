"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCard {
  label: string
  value: string
  change: string
  isPositive: boolean
}

export function AnalyticsMetrics({ data }: { data: any }) {
  const displayMetrics = [
    {
      label: "Total Violations",
      value: data?.totalViolations?.toString() || "342",
      change: "+15% from last month",
      isPositive: false,
    },
    {
      label: "Average Compliance",
      value: data?.complianceScore ? `${data.complianceScore}%` : "92.3%",
      change: "+2.1% from last month",
      isPositive: true,
    },
    {
      label: "Uptime Score",
      value: data?.systemUptime ? `${data.systemUptime}%` : "99.8%",
      change: "Stable",
      isPositive: true,
    },
    {
      label: "Response Avg",
      value: data?.averageResponseTime ? `${data.averageResponseTime}s` : "2.3s",
      change: "-0.5s improvement",
      isPositive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayMetrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border border-[#222]">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1">
                {metric.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-success" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-destructive" />
                )}
                <span className={`text-[10px] font-semibold ${metric.isPositive ? "text-success" : "text-destructive"}`}>
                  {metric.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
