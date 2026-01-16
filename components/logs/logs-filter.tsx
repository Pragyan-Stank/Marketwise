"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FiltersProps {
  severity: string
  type: string
  camera: string
  dateRange: string
}

interface LogsFilterProps {
  filters: FiltersProps
  onFiltersChange: (filters: FiltersProps) => void
}

export function LogsFilter({ filters, onFiltersChange }: LogsFilterProps) {
  const updateFilter = (key: keyof FiltersProps, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <Card className="bg-card border-border p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Severity Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Severity</label>
          <select
            value={filters.severity}
            onChange={(e) => updateFilter("severity", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Violation Type</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
          >
            <option value="all">All Types</option>
            <option value="ppe">PPE Violations</option>
            <option value="posture">Posture Issues</option>
            <option value="hazard">Hazards</option>
          </select>
        </div>

        {/* Camera Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Camera</label>
          <select
            value={filters.camera}
            onChange={(e) => updateFilter("camera", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
          >
            <option value="all">All Cameras</option>
            <option value="zone-a">Zone A - North</option>
            <option value="zone-b">Zone B - Warehouse</option>
            <option value="zone-c">Zone C - Loading Dock</option>
            <option value="zone-d">Zone D - Restricted</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter("dateRange", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
          >
            <option value="1day">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply Filters</Button>
        <Button
          variant="outline"
          onClick={() =>
            onFiltersChange({
              severity: "all",
              type: "all",
              camera: "all",
              dateRange: "7days",
            })
          }
        >
          Reset
        </Button>
      </div>
    </Card>
  )
}
