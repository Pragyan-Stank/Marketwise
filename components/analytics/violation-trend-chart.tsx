"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { analyticsAPI } from "@/services/api"

interface ViolationTrendChartProps {
  timeRange: "7days" | "30days" | "90days"
}

export function ViolationTrendChart({ timeRange }: ViolationTrendChartProps) {
  const [data, setData] = useState([
    { date: "Mon", violations: 12 },
    { date: "Tue", violations: 15 },
    { date: "Wed", violations: 8 },
    { date: "Thu", violations: 18 },
    { date: "Fri", violations: 14 },
    { date: "Sat", violations: 5 },
    { date: "Sun", violations: 3 },
  ])

  useEffect(() => {
    analyticsAPI.getViolationsTrend(timeRange).then((result) => {
      setData(result || data)
    })
  }, [timeRange])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Violation Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Line type="monotone" dataKey="violations" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
