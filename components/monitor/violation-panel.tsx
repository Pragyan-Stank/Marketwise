"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Eye } from "lucide-react"
import { PPEChecklist } from "./ppe-checklist"

interface ViolationPanelProps {
  selectedCamera: string | null
  detectionMode: "ppe" | "posture" | "hazard"
}

export function ViolationPanel({ selectedCamera, detectionMode }: ViolationPanelProps) {
  const violations =
    detectionMode === "ppe"
      ? [
          { type: "Missing Hard Hat", confidence: "98.5%", timestamp: "2 seconds ago" },
          { type: "No Safety Vest", confidence: "95.2%", timestamp: "15 seconds ago" },
          { type: "Missing Gloves", confidence: "92.1%", timestamp: "32 seconds ago" },
        ]
      : detectionMode === "posture"
        ? [
            { type: "Unsafe Bending", confidence: "87.3%", timestamp: "5 seconds ago" },
            { type: "Unstable Standing", confidence: "84.9%", timestamp: "18 seconds ago" },
          ]
        : [
            { type: "Hazardous Material", confidence: "96.4%", timestamp: "3 seconds ago" },
            { type: "Obstruction Detected", confidence: "91.2%", timestamp: "12 seconds ago" },
          ]

  return (
    <div className="space-y-4">
      {/* Detection Mode Info */}
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Active Detection: {detectionMode.charAt(0).toUpperCase() + detectionMode.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {detectionMode === "ppe"
              ? "Monitoring for Personal Protective Equipment compliance"
              : detectionMode === "posture"
                ? "Monitoring for unsafe body positions and movements"
                : "Monitoring for environmental hazards and obstructions"}
          </p>
        </CardContent>
      </Card>

      {/* PPE Checklist */}
      {detectionMode === "ppe" && selectedCamera && (
        <PPEChecklist
          personId="Worker #001"
          ppeStatus={{
            helmet: false,
            shoes: true,
            goggles: false,
            mask: true,
          }}
          confidence={0.94}
        />
      )}

      {/* Violations List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Detected Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCamera ? (
            <div className="space-y-3">
              {violations.map((violation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{violation.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                        {violation.confidence}
                      </span>
                      <span className="text-xs text-muted-foreground">{violation.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">Select a camera to view violations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-sm">Detection Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Confidence</span>
              <span className="text-sm font-medium">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Processing Time</span>
              <span className="text-sm font-medium">45ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Streams</span>
              <span className="text-sm font-medium">5/6</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
