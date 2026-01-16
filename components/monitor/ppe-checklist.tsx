"use client"

import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface PPEStatus {
  helmet: boolean
  shoes: boolean
  goggles: boolean
  mask: boolean
}

interface PPEChecklistProps {
  personId: string
  ppeStatus: PPEStatus
  confidence: number
}

const PPE_ITEMS = [
  { key: "helmet", label: "Hard Hat", icon: "🪖" },
  { key: "shoes", label: "Safety Shoes", icon: "👞" },
  { key: "goggles", label: "Safety Goggles", icon: "🥽" },
  { key: "mask", label: "Face Mask", icon: "😷" },
]

export function PPEChecklist({ personId, ppeStatus, confidence }: PPEChecklistProps) {
  const completedItems = Object.values(ppeStatus).filter(Boolean).length
  const totalItems = Object.keys(ppeStatus).length

  return (
    <Card className="bg-card border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">PPE Compliance</h3>
          <p className="text-xs text-muted-foreground">{personId}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {completedItems}/{totalItems}
          </div>
          <p className="text-xs text-muted-foreground">{Math.round(confidence * 100)}% confidence</p>
        </div>
      </div>

      <div className="space-y-2">
        {PPE_ITEMS.map((item) => {
          const isComplete = ppeStatus[item.key as keyof PPEStatus]
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isComplete ? "bg-accent/10 border border-accent/20" : "bg-primary/10 border border-primary/20"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              <span className="flex-1 text-sm text-foreground">{item.label}</span>
              {isComplete ? <Check className="w-4 h-4 text-accent" /> : <X className="w-4 h-4 text-primary" />}
            </div>
          )
        })}
      </div>

      {/* Compliance summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {completedItems === totalItems
            ? "All PPE requirements met ✓"
            : `Missing ${totalItems - completedItems} PPE item${totalItems - completedItems !== 1 ? "s" : ""}`}
        </p>
      </div>
    </Card>
  )
}
