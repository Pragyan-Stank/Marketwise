"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { analyticsAPI } from "@/services/api"

interface ComplianceScoreChartProps {
  timeRange: "7days" | "30days" | "90days"
}

export function ComplianceScoreChart({ timeRange }: ComplianceScoreChartProps) {
  const [data, setData] = useState([
    { date: "Mon", score: 85 },
    { date: "Tue", score: 84 },
    { date: "Wed", score: 88 },
    { date: "Thu", score: 86 },
    { date: "Fri", score: 87 },
    { date: "Sat", score: 90 },
    { date: "Sun", score: 92 },
  ])

  useEffect(() => {
    analyticsAPI.getComplianceScore(timeRange).then((result) => {
      setData(result || data)
    })
  }, [timeRange])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Compliance Score</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" domain={[80, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Area type="monotone" dataKey="score" stroke="var(--accent)" fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
