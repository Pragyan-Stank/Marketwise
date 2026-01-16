import { Sidebar } from "@/components/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ViolationsTable } from "@/components/dashboard/violations-table"
import { SystemStatus } from "@/components/dashboard/system-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TrainingMetrics } from "@/components/dashboard/training-metrics"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time safety compliance monitoring overview</p>
          </div>

          {/* Stats Cards */}
          <StatsCards />

          {/* Training Metrics Chart */}
          <TrainingMetrics />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Violations Table */}
            <div className="lg:col-span-2">
              <ViolationsTable />
            </div>

            {/* System Status & Recent Activity */}
            <div className="space-y-6">
              <SystemStatus />
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
