"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Upload,
    FileVideo,
    Play,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Download
} from "lucide-react"
import { safetyMonitorAPI, VideoAnalysisResult } from "@/services/api"

export function VideoUpload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (!file.type.startsWith("video/")) {
                setError("Please select a valid video file")
                return
            }
            setSelectedFile(file)
            setError(null)
            setAnalysisResult(null)
        }
    }

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        const file = event.dataTransfer.files?.[0]
        if (file) {
            if (!file.type.startsWith("video/")) {
                setError("Please select a valid video file")
                return
            }
            setSelectedFile(file)
            setError(null)
            setAnalysisResult(null)
        }
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setUploadProgress(0)
        setError(null)

        // Simulate progress for UX
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 500)

        try {
            const result = await safetyMonitorAPI.analyzeVideo(selectedFile)
            setUploadProgress(100)
            setAnalysisResult(result)
        } catch (err) {
            setError("Failed to analyze video. Please ensure the backend server is running.")
            console.error("Upload error:", err)
        } finally {
            clearInterval(progressInterval)
            setIsUploading(false)
        }
    }

    const handleClear = () => {
        setSelectedFile(null)
        setAnalysisResult(null)
        setError(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileVideo className="w-5 h-5" />
                    Video Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Area */}
                {!selectedFile && !analysisResult && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-full bg-muted">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Drop a video file here or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Supports MP4, WebM, AVI (Max 100MB)
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Selected File */}
                {selectedFile && !analysisResult && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                            <FileVideo className="w-8 h-8 text-primary" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                            {!isUploading && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClear}
                                    className="h-8 w-8"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Analyzing video...</span>
                                    <span className="font-medium">{uploadProgress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        {!isUploading && (
                            <Button
                                onClick={handleUpload}
                                className="w-full gap-2 bg-primary hover:bg-primary/90"
                            >
                                <Play className="w-4 h-4" />
                                Start Analysis
                            </Button>
                        )}

                        {isUploading && (
                            <Button disabled className="w-full gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                            </Button>
                        )}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="text-sm text-primary">{error}</p>
                    </div>
                )}

                {/* Analysis Result */}
                {analysisResult && (
                    <div className="space-y-4">
                        {/* Success Message */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                            <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                            <p className="text-sm text-accent">Analysis complete!</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {analysisResult.total_frames}
                                </p>
                                <p className="text-xs text-muted-foreground">Frames Processed</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border border-border text-center">
                                <p className="text-2xl font-bold text-primary">
                                    {analysisResult.logs?.filter(l => l.status === "VIOLATION").length || 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Violations Found</p>
                            </div>
                        </div>

                        {/* Video Preview */}
                        {analysisResult.video_url && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Processed Video:</p>
                                <div className="aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                                    <video
                                        src={safetyMonitorAPI.getStaticVideoUrl(analysisResult.video_url)}
                                        controls
                                        className="w-full h-full"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        window.open(safetyMonitorAPI.getStaticVideoUrl(analysisResult.video_url), "_blank")
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                    Download Processed Video
                                </Button>
                            </div>
                        )}

                        {/* New Analysis Button */}
                        <Button
                            variant="outline"
                            onClick={handleClear}
                            className="w-full"
                        >
                            Analyze Another Video
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
