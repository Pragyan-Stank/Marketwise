"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ViolationTrendChart } from "@/components/analytics/violation-trend-chart"
import { ComplianceScoreChart } from "@/components/analytics/compliance-score-chart"
import { ViolationTypeChart } from "@/components/analytics/violation-type-chart"
import { CameraComparisonChart } from "@/components/analytics/camera-comparison-chart"
import { AnalyticsMetrics } from "@/components/analytics/analytics-metrics"

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days">("30days")

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-2">Compliance trends, violations, and system performance</p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(["7days", "30days", "90days"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground hover:bg-card/80"
                  }`}
                >
                  {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : "90 Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Metrics */}
          <AnalyticsMetrics />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationTrendChart timeRange={timeRange} />
            <ComplianceScoreChart timeRange={timeRange} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationTypeChart />
            <CameraComparisonChart />
          </div>
        </div>
      </main>
    </div>
  )
}
