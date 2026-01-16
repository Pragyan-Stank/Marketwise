import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ViolationTrendChartProps {
  timeRange: "7days" | "30days" | "90days"
  data?: any[]
}

export function ViolationTrendChart({ timeRange, data }: ViolationTrendChartProps) {
  const defaultData = [
    { date: "Mon", violations: 12 },
    { date: "Tue", violations: 15 },
    { date: "Wed", violations: 8 },
    { date: "Thu", violations: 18 },
    { date: "Fri", violations: 14 },
    { date: "Sat", violations: 5 },
    { date: "Sun", violations: 3 },
  ]

  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <Card className="bg-card border-border border-[#222]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Violation Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#555"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => str.length > 10 ? str.split('-').slice(1).join('/') : str}
            />
            <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "0.5rem",
                fontSize: "12px"
              }}
              labelStyle={{ color: "#fff", fontWeight: "bold", marginBottom: "4px" }}
              itemStyle={{ color: "var(--primary)" }}
            />
            <Line
              type="monotone"
              dataKey="violations"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 6, stroke: "#000", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
