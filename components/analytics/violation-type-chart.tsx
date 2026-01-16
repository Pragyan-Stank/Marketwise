"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { analyticsAPI } from "@/services/api"

export function ViolationTypeChart() {
  const [data, setData] = useState([
    { type: "PPE Violations", count: 185 },
    { type: "Posture Issues", count: 98 },
    { type: "Hazard Access", count: 59 },
  ])

  useEffect(() => {
    analyticsAPI.getSummary().then((result: any) => {
      if (result && result.missing) {
        const formattedData = Object.entries(result.missing).map(([type, count]) => ({
          type,
          count: count as number,
        }))
        setData(formattedData.length > 0 ? formattedData : data)
      }
    })
  }, [])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Violations by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="type" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
