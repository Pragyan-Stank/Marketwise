"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, Wifi, WifiOff } from "lucide-react"

interface Camera {
  id: string
  name: string
  location: string
  online: boolean
  violations: number
}

const cameras: Camera[] = [
  { id: "1", name: "Camera 1", location: "Zone A - North", online: true, violations: 2 },
  { id: "2", name: "Camera 2", location: "Zone B - Warehouse", online: true, violations: 0 },
  { id: "3", name: "Camera 3", location: "Zone C - Loading Dock", online: true, violations: 3 },
  { id: "4", name: "Camera 4", location: "Zone D - Restricted", online: false, violations: 0 },
  { id: "5", name: "Camera 5", location: "Zone E - Office", online: true, violations: 1 },
  { id: "6", name: "Camera 6", location: "Zone F - Parking", online: true, violations: 0 },
]

interface CameraGridProps {
  selectedCamera: string | null
  onSelectCamera: (id: string) => void
}

export function CameraGrid({ selectedCamera, onSelectCamera }: CameraGridProps) {
  const [hoveredCamera, setHoveredCamera] = useState<string | null>(null)

  return (
    <Card className="bg-card border-border p-6">
      <h2 className="text-xl font-semibold mb-4">Camera Feeds</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cameras.map((camera) => (
          <button
            key={camera.id}
            onClick={() => onSelectCamera(camera.id)}
            onMouseEnter={() => setHoveredCamera(camera.id)}
            onMouseLeave={() => setHoveredCamera(null)}
            className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
              selectedCamera === camera.id ? "ring-2 ring-primary" : ""
            }`}
          >
            {/* Mock Video Feed Background */}
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center relative">
              <div className="text-center space-y-2 z-10">
                <div className="text-sm font-medium text-foreground">{camera.name}</div>
                <div className="text-xs text-muted-foreground">{camera.location}</div>
              </div>

              {/* Animated grid overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="border border-destructive/20" />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm">
              {camera.online ? (
                <>
                  <Wifi className="w-3 h-3 text-accent" />
                  <span className="text-xs text-accent">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">Offline</span>
                </>
              )}
            </div>

            {/* Violation Badge */}
            {camera.violations > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/20 border border-primary/50">
                <AlertCircle className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary">{camera.violations} violations</span>
              </div>
            )}

            {/* Hover Overlay */}
            {hoveredCamera === camera.id && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                <div className="text-primary text-sm font-medium">Click to focus</div>
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  )
}
