"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    User,
    Clock,
    XCircle,
    Loader2
} from "lucide-react"
import { safetyMonitorAPI, DetectionLog } from "@/services/api"

interface DetectionLogsProps {
    isMonitorActive: boolean
    refreshInterval?: number // in milliseconds
}

export function DetectionLogs({ isMonitorActive, refreshInterval = 2000 }: DetectionLogsProps) {
    const [logs, setLogs] = useState<DetectionLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState({ total_violations: 0, compliance_rate: 100 })
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const fetchLogs = async () => {
        try {
            const [logsData, statsData] = await Promise.all([
                safetyMonitorAPI.getLogs(),
                safetyMonitorAPI.getStats(),
            ])
            setLogs(logsData.logs || [])
            setStats(statsData)
        } catch (error) {
            console.error("Failed to fetch logs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()

        // Auto-refresh when monitoring is active
        if (isMonitorActive) {
            intervalRef.current = setInterval(fetchLogs, refreshInterval)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isMonitorActive, refreshInterval])

    const formatTimestamp = (isoString: string): string => {
        try {
            const date = new Date(isoString)
            const now = new Date()
            const diffMs = now.getTime() - date.getTime()
            const diffSec = Math.floor(diffMs / 1000)

            if (diffSec < 60) return `${diffSec}s ago`
            if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
            if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
            return date.toLocaleString()
        } catch {
            return isoString
        }
    }

    const formatMissingGear = (missing: string[]): string => {
        if (!missing || missing.length === 0) return "All PPE present"
        return `Missing: ${missing.join(", ")}`
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">Detection Logs</CardTitle>
                <div className="flex items-center gap-2">
                    {isMonitorActive && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                            Live
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setIsLoading(true)
                            fetchLogs()
                        }}
                        disabled={isLoading}
                        className="h-7 px-2"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </CardHeader>

            {/* Stats Bar */}
            <div className="px-6 pb-3">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex-1 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Violations:</span>
                        <span className="text-sm font-semibold text-primary">{stats.total_violations}</span>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex-1 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        <span className="text-sm text-muted-foreground">Compliance:</span>
                        <span className="text-sm font-semibold text-accent">{stats.compliance_rate}%</span>
                    </div>
                </div>
            </div>

            <CardContent className="max-h-[400px] overflow-y-auto">
                {isLoading && logs.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle className="w-12 h-12 text-accent/50 mb-3" />
                        <p className="text-sm text-muted-foreground">No detections yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isMonitorActive ? "Waiting for activity..." : "Start monitoring to detect violations"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {logs.map((log, index) => (
                            <div
                                key={`${log.id}-${log.timestamp}-${index}`}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${log.status === "VIOLATION"
                                        ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
                                        : "bg-accent/5 border border-accent/20 hover:bg-accent/10"
                                    }`}
                            >
                                {/* Status Icon */}
                                <div className={`p-1.5 rounded-full flex-shrink-0 ${log.status === "VIOLATION" ? "bg-primary/20" : "bg-accent/20"
                                    }`}>
                                    {log.status === "VIOLATION" ? (
                                        <AlertTriangle className="w-4 h-4 text-primary" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 text-accent" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                Person #{log.id}
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${log.status === "VIOLATION"
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-accent/20 text-accent"
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatTimestamp(log.timestamp)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatMissingGear(log.missing)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
