"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Video,
    Wifi,
    WifiOff,
    Trash2,
    AlertTriangle,
    Activity,
    Monitor as MonitorIcon,
    ChevronRight,
    Loader2,
    Globe,
    User,
    CheckCircle,
    Clock,
    RefreshCw
} from "lucide-react"
import { monitorAPI, safetyMonitorAPI, CameraConfig, DetectionLog } from "@/services/api"
import { AddCameraModal } from "./add-camera-modal"

interface LiveFeedProps {
    isMonitorActive: boolean
}

export function LiveFeed({ isMonitorActive }: LiveFeedProps) {
    const [cameras, setCameras] = useState<CameraConfig[]>([])
    const [logs, setLogs] = useState<DetectionLog[]>([])
    const [stats, setStats] = useState({ total_violations: 0, compliance_rate: 100 })
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Load cameras on mount
    const fetchCameras = async () => {
        try {
            const data = await monitorAPI.getCameras()
            setCameras(data)
            if (data.length > 0 && !selectedCameraId) {
                setSelectedCameraId(data[0].id || null)
            }
        } catch (error) {
            console.error("Failed to fetch cameras:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchLogsAndStats = async () => {
        try {
            const [logsData, statsData] = await Promise.all([
                safetyMonitorAPI.getLogs(),
                safetyMonitorAPI.getStats(),
            ])
            setLogs(logsData.logs || [])
            setStats(statsData)
        } catch (error) {
            // Silently fail to avoid cluttering UI with error bars
        }
    }

    useEffect(() => {
        fetchCameras()
        fetchLogsAndStats()

        if (isMonitorActive) {
            intervalRef.current = setInterval(() => {
                fetchLogsAndStats()
            }, 3000)
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isMonitorActive])

    const handleAddCamera = async (config: CameraConfig) => {
        try {
            const result = await monitorAPI.addCamera(config)
            if (result.status === 'success') {
                setCameras(prev => [...prev, result.camera])
                if (!selectedCameraId) setSelectedCameraId(result.camera.id || null)
                fetchCameras() // Refresh list to sync IDs
            }
        } catch (error) {
            console.error("Add camera failed:", error)
        }
    }

    const handleDeleteCamera = async (id: string) => {
        try {
            const result = await monitorAPI.deleteCamera(id)
            if (result.status === 'success') {
                setCameras(prev => prev.filter(c => c.id !== id))
                if (selectedCameraId === id) setSelectedCameraId(null)
            }
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const getCameraName = (id: string | null) => {
        if (!id) return null
        return cameras.find(c => c.id === id)?.name || null
    }

    const selectedCameraName = getCameraName(selectedCameraId)
    const filteredLogs = selectedCameraId
        ? logs.filter(log => log.source === selectedCameraName).slice(0, 10)
        : logs.slice(0, 10)

    const formatTimestamp = (isoString: string): string => {
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch { return "Now" }
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MonitorIcon className="w-5 h-5 text-primary" />
                                Camera Feeds
                            </h2>
                            <div className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground uppercase">
                                {cameras.length} Active
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 gap-2 h-9 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add Camera
                        </Button>
                    </div>

                    {/* Camera Grid */}
                    {loading ? (
                        <div className="min-h-[400px] flex items-center justify-center rounded-2xl bg-[#0E0E0E] border border-dashed border-border">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-sm text-muted-foreground font-medium">Initializing feeds...</span>
                            </div>
                        </div>
                    ) : cameras.length === 0 ? (
                        <div className="min-h-[400px] flex items-center justify-center rounded-2xl bg-[#111] border border-dashed border-border group cursor-pointer hover:bg-muted/10 transition-all" onClick={() => setIsAddModalOpen(true)}>
                            <div className="flex flex-col items-center gap-4 text-center max-w-xs p-6">
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Video className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1 text-foreground">No Active Cameras</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">Add a local webcam or IP camera stream to start real-time safety monitoring.</p>
                                </div>
                                <Button className="gap-2 bg-primary">
                                    <Plus className="w-4 h-4" />
                                    Configure First Camera
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cameras.map((cam) => (
                                <Card
                                    key={cam.id}
                                    className={`relative overflow-hidden group border-2 transition-all cursor-pointer ${selectedCameraId === cam.id ? 'border-primary ring-2 ring-primary/20 shadow-2xl bg-[#161616]' : 'border-border grayscale hover:grayscale-0 hover:border-primary/50 bg-[#121212]'
                                        }`}
                                    onClick={() => setSelectedCameraId(cam.id || null)}
                                >
                                    {/* Video Stream */}
                                    <div className="aspect-video bg-black relative">
                                        {isMonitorActive ? (
                                            <img
                                                src={monitorAPI.getLiveFeedUrl(cam.id!)}
                                                alt={cam.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                                <WifiOff className="w-10 h-10 text-muted-foreground/30" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feed Standby</span>
                                            </div>
                                        )}

                                        {/* Status Indicators */}
                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-extrabold backdrop-blur-md border ${isMonitorActive ? 'bg-accent/40 text-accent border-accent/20' : 'bg-black/60 text-muted-foreground border-white/10'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isMonitorActive ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                                                {isMonitorActive ? 'LIVE' : 'OFFLINE'}
                                            </div>
                                        </div>

                                        {/* Delete Button */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg shadow-xl"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteCamera(cam.id!)
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Footer Info */}
                                    <div className="p-4 flex items-center justify-between border-t border-white/5">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm truncate uppercase tracking-tight">{cam.name}</h3>
                                            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 uppercase">
                                                <Globe className="w-3 h-3" />
                                                {cam.zone}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`px-2 py-1 rounded bg-destructive/10 border border-destructive/20 flex items-center gap-1.5 ${logs.filter(l => l.source === cam.name && l.status === "VIOLATION").length > 0 ? 'opacity-100' : 'opacity-30'}`}>
                                                <AlertTriangle className="w-3 h-3 text-destructive" />
                                                <span className="text-[10px] font-bold text-destructive">
                                                    {logs.filter(l => l.source === cam.name && l.status === "VIOLATION").length} Violations
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar Details Area */}
                <div className="space-y-6">
                    {/* Active Detection Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 to-transparent border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-24 h-24 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 text-primary mb-3">
                            <AlertTriangle className="w-4 h-4" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[2px]">AI Protocol: PPE</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            Monitoring worker safety equipment compliance across all active streams.
                        </p>
                    </div>

                    {/* Stats Summary */}
                    <div className="p-5 rounded-2xl bg-[#111] border border-border shadow-inner">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 border-b border-border pb-2">Global Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">Compliance Rate</span>
                                <span className="text-sm font-bold text-accent">{stats.compliance_rate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">Total Violations</span>
                                <span className="text-sm font-bold text-primary">{stats.total_violations}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground font-medium">Detection Lag</span>
                                <span className="text-sm font-bold text-foreground">42ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Real-time Violation List */}
                    <div className="p-5 rounded-2xl bg-[#111] border border-border flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Events</h3>
                            <button onClick={fetchLogsAndStats} className="text-primary hover:text-primary/80">
                                <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
                            {filteredLogs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-10 opacity-30">
                                    <CheckCircle className="w-10 h-10 mb-2" />
                                    <p className="text-[10px] font-bold uppercase">No Violations</p>
                                </div>
                            ) : (
                                filteredLogs.map((log, idx) => (
                                    <div key={idx} className="p-3 rounded-xl bg-muted/20 border border-white/5 space-y-2 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase">
                                                <AlertTriangle className="w-3 h-3" />
                                                Violation
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{formatTimestamp(log.timestamp)}</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-foreground truncate">{log.source}</p>
                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                            {log.missing.length > 0 ? `Missing ${log.missing.join(", ")}` : "Safety Gear Mismatch"}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <p className="mt-4 pt-4 border-t border-border text-[9px] text-center font-bold text-muted-foreground uppercase tracking-widest">
                            {selectedCameraId ? `Showing: ${selectedCameraName}` : "Showing: All Feeds"}
                        </p>
                    </div>
                </div>
            </div>

            <AddCameraModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCamera}
            />
        </div>
    )
}
