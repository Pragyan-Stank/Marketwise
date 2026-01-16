import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ComplianceScoreChartProps {
  timeRange: "7days" | "30days" | "90days"
  data?: any[]
}

export function ComplianceScoreChart({ timeRange, data }: ComplianceScoreChartProps) {
  const defaultData = [
    { date: "Mon", score: 85 },
    { date: "Tue", score: 84 },
    { date: "Wed", score: 88 },
    { date: "Thu", score: 86 },
    { date: "Fri", score: 87 },
    { date: "Sat", score: 90 },
    { date: "Sun", score: 92 },
  ]

  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <Card className="bg-card border-border border-[#222]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Compliance Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#555"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(str) => str.length > 10 ? str.split('-').slice(1).join('/') : str}
            />
            <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "0.5rem",
                fontSize: "12px"
              }}
              labelStyle={{ color: "#fff", fontWeight: "bold", marginBottom: "4px" }}
              itemStyle={{ color: "var(--accent)" }}
            />
            <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
