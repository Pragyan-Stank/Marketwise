import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ViolationTypeChart({ data }: { data: any }) {
  const defaultData = [
    { type: "Mask", count: 42 },
    { type: "Gloves", count: 35 },
    { type: "Goggles", count: 56 },
    { type: "Coverall", count: 88 },
    { type: "Face Shield", count: 62 },
  ]

  const chartData = data
    ? Object.entries(data).map(([type, count]) => ({ type, count: count as number }))
    : defaultData

  return (
    <Card className="bg-card border-border border-[#222]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
          Missing PPE by Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="type" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
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
            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
