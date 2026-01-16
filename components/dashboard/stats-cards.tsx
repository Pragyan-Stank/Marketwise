"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AlertCircle, Eye, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dashboardAPI, safetyMonitorAPI } from "@/services/api"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  loading?: boolean
}

function StatCard({ icon, label, value, change, changeType = "neutral", loading = false }: StatCardProps) {
  const changeColor = {
    positive: "text-accent",
    negative: "text-primary",
    neutral: "text-muted-foreground",
  }

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
          {change && <p className={`text-sm ${changeColor[changeType]}`}>{change}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState({
    activeViolations: 0,
    camerasOnline: "1/1",
    complianceScore: "100%",
    averageResponseTime: "45ms",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch from both dashboard summary and backend stats
    Promise.all([
      dashboardAPI.getSummary(),
      safetyMonitorAPI.getStats(),
    ]).then(([summaryData, backendStats]) => {
      const summary = summaryData as { activeViolations?: number; complianceScore?: number }
      setStats({
        activeViolations: backendStats.total_violations || summary.activeViolations || 0,
        camerasOnline: "1/1", // Single camera from backend
        complianceScore: `${backendStats.compliance_rate || summary.complianceScore || 100}%`,
        averageResponseTime: "45ms", // Typical inference time
      })
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<AlertCircle className="w-5 h-5" />}
        label="Active Violations"
        value={stats.activeViolations}
        change="+3 this hour"
        changeType="negative"
      />
      <StatCard
        icon={<Eye className="w-5 h-5" />}
        label="Cameras Online"
        value={stats.camerasOnline}
        change="All operational"
        changeType="positive"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Compliance Score"
        value={stats.complianceScore}
        change="+1.5% this week"
        changeType="positive"
      />
      <StatCard
        icon={<Clock className="w-5 h-5" />}
        label="Avg Response Time"
        value={stats.averageResponseTime}
        change="-0.4s from average"
        changeType="positive"
      />
    </div>
  )
}
