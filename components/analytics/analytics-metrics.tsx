"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCard {
  label: string
  value: string
  change: string
  isPositive: boolean
}

const metrics: MetricCard[] = [
  {
    label: "Total Violations",
    value: "342",
    change: "+15% from previous period",
    isPositive: false,
  },
  {
    label: "Average Compliance",
    value: "92.3%",
    change: "+2.1% from previous period",
    isPositive: true,
  },
  {
    label: "Critical Incidents",
    value: "8",
    change: "-3 from previous period",
    isPositive: true,
  },
  {
    label: "Detection Rate",
    value: "96.8%",
    change: "+0.5% from previous period",
    isPositive: true,
  },
]

export function AnalyticsMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1">
                {metric.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={`text-xs font-medium ${metric.isPositive ? "text-success" : "text-destructive"}`}>
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
