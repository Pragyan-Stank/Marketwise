"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { LogsTable } from "@/components/logs/logs-table"
import { LogsFilter } from "@/components/logs/logs-filter"

export default function Logs() {
  const [filters, setFilters] = useState({
    severity: "all",
    type: "all",
    camera: "all",
    dateRange: "7days",
  })

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Detection Logs</h1>
            <p className="text-muted-foreground mt-2">Historical record of all detected violations and system events</p>
          </div>

          {/* Filters */}
          <LogsFilter filters={filters} onFiltersChange={setFilters} />

          {/* Logs Table */}
          <LogsTable filters={filters} />
        </div>
      </main>
    </div>
  )
}
