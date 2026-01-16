"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CameraControlsProps {
  detectionMode: "ppe" | "posture" | "hazard"
  onDetectionModeChange: (mode: "ppe" | "posture" | "hazard") => void
}

export function CameraControls({ detectionMode, onDetectionModeChange }: CameraControlsProps) {
  return (
    <Card className="bg-card border-border p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Detection Mode</h3>
          <div className="flex gap-2">
            {(["ppe", "posture", "hazard"] as const).map((mode) => (
              <Button
                key={mode}
                onClick={() => onDetectionModeChange(mode)}
                variant={detectionMode === mode ? "default" : "outline"}
                className={
                  detectionMode === mode
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border hover:bg-card"
                }
              >
                {mode === "ppe" ? "PPE Detection" : mode === "posture" ? "Posture Detection" : "Hazard Detection"}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
