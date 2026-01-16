import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function CameraComparisonChart({ data }: { data: any[] }) {
  const defaultData = [
    { camera: "Cam 1", violations: 25, uptime: 99.8, efficiency: 92 },
    { camera: "Cam 2", violations: 45, uptime: 99.5, efficiency: 88 },
    { camera: "Cam 3", violations: 38, uptime: 99.9, efficiency: 90 },
    { camera: "Cam 5", violations: 52, uptime: 99.2, efficiency: 85 },
    { camera: "Cam 6", violations: 18, uptime: 99.9, efficiency: 94 },
  ]

  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <Card className="bg-card border-border border-[#222]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
          Violations by Camera
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="camera" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "0.5rem",
                fontSize: "12px"
              }}
              labelStyle={{ color: "#fff", fontWeight: "bold", marginBottom: "4px" }}
            />
            <Bar dataKey="violations" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
