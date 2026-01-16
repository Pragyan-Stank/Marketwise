"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
    Scissors,
    Play,
    Pause,
    Check,
    RotateCcw,
    SkipBack,
    SkipForward
} from "lucide-react"

interface VideoTrimmerProps {
    file: File
    onTrim: (startTime: number, endTime: number) => void
    onCancel: () => void
}

export function VideoTrimmer({ file, onTrim, onCancel }: VideoTrimmerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [duration, setDuration] = useState(0)
    const [range, setRange] = useState<[number, number]>([0, 0])
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [videoUrl, setVideoUrl] = useState<string>("")

    useEffect(() => {
        const url = URL.createObjectURL(file)
        setVideoUrl(url)
        return () => URL.revokeObjectURL(url)
    }, [file])

    const onLoadedMetadata = () => {
        if (videoRef.current) {
            const d = videoRef.current.duration
            setDuration(d)
            setRange([0, Math.min(d, 30)]) // Default to first 30s or full duration
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            // Loop back to start of range if playing past end
            if (isPlaying && videoRef.current.currentTime >= range[1]) {
                videoRef.current.currentTime = range[0]
            }
        }
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                if (videoRef.current.currentTime >= range[1]) {
                    videoRef.current.currentTime = range[0]
                }
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleRangeChange = (newRange: number[]) => {
        const val = newRange as [number, number]
        setRange(val)
        if (videoRef.current) {
            // Seek to start of range when adjusting start, or end when adjusting end
            if (val[0] !== range[0]) {
                videoRef.current.currentTime = val[0]
            } else if (val[1] !== range[1]) {
                videoRef.current.currentTime = val[1]
            }
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 group">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={onLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                />

                {/* Custom Video Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => { if (videoRef.current) videoRef.current.currentTime = range[0] }}>
                            <SkipBack className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={togglePlay}
                            variant="secondary"
                            size="icon"
                            className="w-12 h-12 rounded-full bg-white text-black hover:scale-110 transition-transform"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => { if (videoRef.current) videoRef.current.currentTime = range[1] }}>
                            <SkipForward className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4 p-6 rounded-2xl bg-[#111] border border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Trim Clip</h3>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Start</p>
                            <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-1 rounded-md">{formatTime(range[0])}</span>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mr-1">End</p>
                            <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-1 rounded-md">{formatTime(range[1])}</span>
                        </div>
                        <div className="text-center border-l border-border pl-4">
                            <p className="text-[10px] uppercase font-bold text-primary">Duration</p>
                            <span className="text-xs font-mono font-bold text-primary">{formatTime(range[1] - range[0])}</span>
                        </div>
                    </div>
                </div>

                <div className="px-2 pt-2 pb-8">
                    <Slider
                        value={[range[0], range[1]]}
                        min={0}
                        max={duration}
                        step={0.1}
                        onValueChange={handleRangeChange}
                        className="relative flex items-center select-none touch-none w-full h-5"
                    />
                    <div className="relative w-full h-1 bg-muted/20 mt-[-10px] pointer-events-none rounded-full overflow-hidden">
                        <div
                            className="absolute h-full bg-primary/20"
                            style={{
                                left: `${(range[0] / duration) * 100}%`,
                                width: `${((range[1] - range[0]) / duration) * 100}%`
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="flex-1 rounded-xl h-11 font-bold text-xs uppercase tracking-widest"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onTrim(range[0], range[1])}
                        className="flex-[2] bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Apply & Process
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="p-2 rounded-lg bg-primary/20">
                    <Scissors className="w-4 h-4 text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-0.5">Optimization Tip</strong>
                    Trimming long videos significantly speeds up processing. For best results, select only the segment where safety personnel are visible.
                </p>
            </div>
        </div>
    )
}
