"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ViolationTrendChart } from "@/components/analytics/violation-trend-chart"
import { ComplianceScoreChart } from "@/components/analytics/compliance-score-chart"
import { ViolationTypeChart } from "@/components/analytics/violation-type-chart"
import { CameraComparisonChart } from "@/components/analytics/camera-comparison-chart"
import { AnalyticsMetrics } from "@/components/analytics/analytics-metrics"
import { TrainingMetrics } from "@/components/dashboard/training-metrics"
import { analyticsAPI } from "@/services/api"

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    analyticsAPI.getSummary().then((data) => {
      setAnalyticsData(data)
      setLoading(false)
    }).catch(err => {
      console.error("Failed to fetch analytics:", err)
      setLoading(false)
    })
  }, [timeRange])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#0E0E0E]/50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Analytics Engine</h1>
              <p className="text-muted-foreground mt-1">Advanced safety compliance patterns and model performance</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
              {(["7days", "30days", "90days"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${timeRange === range
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                >
                  {range === "7days" ? "7D" : range === "30days" ? "30D" : "90D"}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Metrics */}
          <AnalyticsMetrics data={analyticsData} />

          {/* Charts Grid - First Row (Trends) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 leading-none">
            <ViolationTrendChart data={analyticsData?.violationTrend} timeRange={timeRange} />
            <ComplianceScoreChart data={analyticsData?.complianceTrend} timeRange={timeRange} />
          </div>

          {/* Charts Grid - Second Row (Breakdowns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationTypeChart data={analyticsData?.missing} />
            <CameraComparisonChart data={analyticsData?.cameraPerformance} />
          </div>

          {/* Model Performance Row */}
          <div className="pt-6 border-t border-border/50">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              AI Training Metrics
            </h2>
            <TrainingMetrics />
          </div>
        </div>
      </main>
    </div>
  )
}
