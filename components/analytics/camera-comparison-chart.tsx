"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { analyticsAPI } from "@/services/api"

export function CameraComparisonChart() {
  const [data, setData] = useState([
    { camera: "Cam 1", violations: 25, uptime: 99.8, efficiency: 92 },
    { camera: "Cam 2", violations: 45, uptime: 99.5, efficiency: 88 },
    { camera: "Cam 3", violations: 38, uptime: 99.9, efficiency: 90 },
    { camera: "Cam 5", violations: 52, uptime: 99.2, efficiency: 85 },
    { camera: "Cam 6", violations: 18, uptime: 99.9, efficiency: 94 },
  ])

  useEffect(() => {
    analyticsAPI.getCameraPerformance().then((result) => {
      setData(result || data)
    })
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Camera Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="camera" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Legend />
            <Bar dataKey="violations" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="efficiency" fill="var(--accent)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
