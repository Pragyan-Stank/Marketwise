"use client"

import { useState, useEffect } from "react"
import { safetyMonitorAPI, VideoHistoryItem } from "@/services/api"
import {
    History,
    ChevronRight,
    Play,
    AlertTriangle,
    Calendar,
    Clock,
    X,
    ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function VideoHistory() {
    const [history, setHistory] = useState<VideoHistoryItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const data = await safetyMonitorAPI.getVideoHistory()
            setHistory(data.history)
        } catch (error) {
            console.error("Failed to fetch video history:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchHistory()
        }
    }, [isOpen])

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatTime = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="h-12 w-10 flex items-center justify-center rounded-l-2xl rounded-r-none bg-primary hover:bg-primary/90 shadow-2xl transition-all duration-300 group"
                    >
                        <ChevronLeft className="w-5 h-5 text-primary-foreground group-hover:-translate-x-0.5 transition-transform" />
                        <div className="absolute -left-16 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Video History
                        </div>
                    </Button>
                </div>
            )}

            {/* Slide-out Panel */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-card border-l border-border z-50 shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            <h2 className="font-bold text-lg">History</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Refresh Button */}
                    <div className="p-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchHistory}
                            disabled={loading}
                            className="w-full text-xs h-8 border-dashed border-[#333] hover:border-primary"
                        >
                            {loading ? "Syncing..." : "Sync History"}
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                                <History className="w-8 h-8 text-muted-foreground mb-2 opacity-20" />
                                <p className="text-sm text-muted-foreground">No processed videos found.</p>
                            </div>
                        ) : (
                            history.map((item, index) => (
                                <Card key={index} className="bg-[#111] border-[#222] hover:border-primary/50 transition-all group overflow-hidden">
                                    <CardContent className="p-3 space-y-3">
                                        {/* Thumbnail / Video Info */}
                                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center group-hover:bg-neutral-900 transition-colors">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={safetyMonitorAPI.getStaticVideoUrl(item.thumbnail_url)}
                                                    alt={item.filename}
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <Play className="w-8 h-8 text-white/50 group-hover:text-primary transition-colors z-10" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded">
                                                    {item.filename.split('.').pop()?.toUpperCase()}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                    {item.total_detections} Frames
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                                                        {item.filename}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(item.timestamp)}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(item.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {item.violations > 0 && (
                                                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center">
                                                        <AlertTriangle className="w-3 h-3 text-primary mb-0.5" />
                                                        <span className="text-[10px] font-bold text-primary leading-none">{item.violations}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs h-8 bg-transparent border-[#333] group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all"
                                                onClick={() => {
                                                    window.open(safetyMonitorAPI.getStaticVideoUrl(item.url), "_blank")
                                                }}
                                            >
                                                Play Video
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-muted/20 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            Processed Archive
                        </p>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
