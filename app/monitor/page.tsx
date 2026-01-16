"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { LiveFeed } from "@/components/monitor/live-feed"
import { MonitoringControls } from "@/components/monitor/monitoring-controls"
import { DetectionLogs } from "@/components/monitor/detection-logs"
import { VideoUpload } from "@/components/monitor/video-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Upload, Activity } from "lucide-react"
import { safetyMonitorAPI } from "@/services/api"
import { VideoHistory } from "@/components/monitor/video-history"

export default function Monitor() {
  const [isMonitorActive, setIsMonitorActive] = useState(false)
  const [activeTab, setActiveTab] = useState("live")

  // Fetch initial monitor status from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await safetyMonitorAPI.getMonitorStatus()
        setIsMonitorActive(status.active)
      } catch (error) {
        console.error("Failed to fetch monitor status:", error)
      }
    }
    fetchStatus()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[#0E0E0E]">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Live Monitor</h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Real-time video feed monitoring with AI detection
              </p>
            </div>
            <div className={`flex items-center gap-6 px-6 py-2.5 rounded-2xl text-sm font-bold border transition-all shadow-lg ${isMonitorActive
              ? "bg-accent/10 text-accent border-accent/20 shadow-accent/5"
              : "bg-muted/10 text-muted-foreground border-border shadow-black/20"
              }`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isMonitorActive
                  ? "bg-accent animate-pulse"
                  : "bg-muted-foreground"
                  }`} />
                {isMonitorActive ? "SYSTEM ACTIVE" : "SYSTEM STANDBY"}
              </div>

              <div className="h-4 w-[1px] bg-border" />

              <button
                onClick={async () => {
                  const newState = !isMonitorActive;
                  await safetyMonitorAPI.toggleMonitor(newState);
                  setIsMonitorActive(newState);
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${isMonitorActive
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                    : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                  }`}
              >
                {isMonitorActive ? "Stop Monitor" : "Start Monitor"}
              </button>
            </div>
          </div>

          {/* Tabs for Live/Upload modes */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-muted/30 border border-border p-1 rounded-2xl">
              <TabsTrigger value="live" className="gap-2 px-6 py-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg">
                <Video className="w-4 h-4" />
                Live Camera Grid
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2 px-6 py-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-lg">
                <Upload className="w-4 h-4" />
                Offline Analytics
              </TabsTrigger>
            </TabsList>

            {/* Live Feed Tab */}
            <TabsContent value="live" className="mt-0 outline-none">
              <LiveFeed isMonitorActive={isMonitorActive} />
              <div className="mt-8">
                <DetectionLogs isMonitorActive={isMonitorActive} />
              </div>
            </TabsContent>

            {/* Video Upload Tab */}
            <TabsContent value="upload" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <VideoUpload />
                </div>
                <div className="space-y-6">
                  {/* Info Card */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">Offline Analysis</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload recorded footage to analyze for safety compliance violations.
                      The AI will process each frame and annotate any detected issues.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Supports MP4, WebM, AVI formats
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Frame-by-frame PPE detection
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Downloadable annotated video
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        Complete violation log export
                      </li>
                    </ul>
                  </div>

                  {/* Quick Tips */}
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="font-semibold text-foreground mb-3">Quick Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Ensure good lighting in the footage</li>
                      <li>• Workers should be clearly visible</li>
                      <li>• Higher resolution yields better results</li>
                      <li>• Processing time depends on video length</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <VideoHistory />
    </div>
  )
}
