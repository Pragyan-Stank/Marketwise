"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { safetyMonitorAPI } from "@/services/api"

interface LiveFeedProps {
    isMonitorActive: boolean
}

export function LiveFeed({ isMonitorActive }: LiveFeedProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [feedKey, setFeedKey] = useState(Date.now())

    const videoFeedUrl = safetyMonitorAPI.getVideoFeedUrl()

    const handleRefresh = () => {
        setIsLoading(true)
        setHasError(false)
        setFeedKey(Date.now()) // Force re-render of img element
    }

    const handleImageLoad = () => {
        setIsLoading(false)
        setHasError(false)
    }

    const handleImageError = () => {
        setIsLoading(false)
        setHasError(true)
    }

    return (
        <Card className={`bg-card border-border overflow-hidden transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50" : ""
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">Live Video Feed</h2>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isMonitorActive
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}>
                        {isMonitorActive ? (
                            <>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                                </span>
                                <span>LIVE</span>
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-muted-foreground"></span>
                                <span>PAUSED</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        className="h-8 w-8"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="h-8 w-8"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-4 w-4" />
                        ) : (
                            <Maximize2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Video Feed Container */}
            <div className={`relative bg-neutral-900 ${isFullscreen ? "h-[calc(100%-60px)]" : "aspect-video"}`}>
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                            <span className="text-sm text-muted-foreground">Connecting to camera...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
                        <div className="flex flex-col items-center gap-4 text-center p-6">
                            <WifiOff className="w-16 h-16 text-primary/50" />
                            <div>
                                <h3 className="text-lg font-medium text-foreground mb-1">Camera Unavailable</h3>
                                <p className="text-sm text-muted-foreground max-w-md">
                                    Unable to connect to the video feed. Make sure the backend server is running at {videoFeedUrl.replace("/video_feed", "")}
                                </p>
                            </div>
                            <Button onClick={handleRefresh} variant="outline" className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Retry Connection
                            </Button>
                        </div>
                    </div>
                )}

                {/* Live MJPEG Stream */}
                <img
                    key={feedKey}
                    src={isMonitorActive ? `${videoFeedUrl}?t=${feedKey}` : ""}
                    alt="Live Camera Feed"
                    className={`w-full h-full object-contain ${hasError || !isMonitorActive ? "hidden" : ""}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />

                {/* Monitoring Paused Overlay */}
                {!isMonitorActive && !hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
                        <div className="flex flex-col items-center gap-4 text-center p-6">
                            <div className="p-4 rounded-full bg-muted/20">
                                <Wifi className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground mb-1">Monitoring Paused</h3>
                                <p className="text-sm text-muted-foreground">
                                    Enable monitoring to start the live video feed
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid Overlay (when active) */}
                {isMonitorActive && !hasError && !isLoading && (
                    <div className="absolute inset-0 pointer-events-none opacity-5">
                        <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
                            {[...Array(24)].map((_, i) => (
                                <div key={i} className="border border-white/30" />
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp Overlay */}
                {isMonitorActive && !hasError && !isLoading && (
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/70 rounded text-xs text-white font-mono backdrop-blur-sm">
                        {new Date().toLocaleTimeString()} • AI Detection Active
                    </div>
                )}
            </div>
        </Card>
    )
}
