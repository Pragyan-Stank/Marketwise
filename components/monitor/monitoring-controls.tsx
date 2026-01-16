"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
    Power,
    Settings,
    Shield,
    Eye,
    Glasses,
    Hand,
    Shirt,
    HardHat,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import { safetyMonitorAPI, settingsAPI } from "@/services/api"

// Gear item definitions matching backend
const GEAR_ITEMS = [
    { id: "mask", label: "Face Mask", icon: Shield, description: "N95/Surgical Mask" },
    { id: "gloves", label: "Hand Gloves", icon: Hand, description: "Protective Gloves" },
    { id: "coverall", label: "Safety Coverall", icon: Shirt, description: "Full Body Coverall" },
    { id: "goggles", label: "Safety Goggles", icon: Glasses, description: "Protective Goggles" },
    { id: "face_shield", label: "Face Shield", icon: HardHat, description: "Full Face Shield" },
]

interface MonitoringControlsProps {
    isMonitorActive: boolean
    onMonitorToggle: (active: boolean) => void
}

export function MonitoringControls({ isMonitorActive, onMonitorToggle }: MonitoringControlsProps) {
    const [sensitivity, setSensitivity] = useState(0.50)
    const [activeGear, setActiveGear] = useState<string[]>(["mask", "gloves", "coverall", "goggles", "face_shield"])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

    // Fetch initial settings from backend
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [thresholdData, gearData] = await Promise.all([
                    settingsAPI.getThreshold(),
                    settingsAPI.getGearSettings(),
                ])
                setSensitivity(thresholdData.conf)
                setActiveGear(gearData.requirements)
            } catch (error) {
                console.error("Failed to fetch settings:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    // Debounced sensitivity update
    const handleSensitivityChange = useCallback(async (value: number[]) => {
        const newValue = value[0]
        setSensitivity(newValue)

        // Debounce the API call
        const timeoutId = setTimeout(async () => {
            try {
                await settingsAPI.setThreshold(newValue)
                showSaveStatus("success")
            } catch (error) {
                console.error("Failed to update sensitivity:", error)
                showSaveStatus("error")
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [])

    // Toggle gear requirement
    const handleGearToggle = async (gearId: string) => {
        const newActiveGear = activeGear.includes(gearId)
            ? activeGear.filter((g) => g !== gearId)
            : [...activeGear, gearId]

        setActiveGear(newActiveGear)
        setIsSaving(true)

        try {
            await settingsAPI.setGearSettings(newActiveGear)
            showSaveStatus("success")
        } catch (error) {
            console.error("Failed to update gear settings:", error)
            // Revert on error
            setActiveGear(activeGear)
            showSaveStatus("error")
        } finally {
            setIsSaving(false)
        }
    }

    // Toggle monitoring
    const handleMonitorToggle = async () => {
        const newState = !isMonitorActive
        setIsSaving(true)

        try {
            await safetyMonitorAPI.toggleMonitor(newState)
            onMonitorToggle(newState)
            showSaveStatus("success")
        } catch (error) {
            console.error("Failed to toggle monitor:", error)
            showSaveStatus("error")
        } finally {
            setIsSaving(false)
        }
    }

    const showSaveStatus = (status: "success" | "error") => {
        setSaveStatus(status)
        setTimeout(() => setSaveStatus("idle"), 2000)
    }

    if (isLoading) {
        return (
            <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Monitoring Toggle */}
            <Card className={`border-2 transition-colors ${isMonitorActive
                ? "bg-accent/5 border-accent/30"
                : "bg-card border-border"
                }`}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isMonitorActive ? "bg-accent/20" : "bg-muted"
                                }`}>
                                <Power className={`w-5 h-5 ${isMonitorActive ? "text-accent" : "text-muted-foreground"
                                    }`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Safety Monitoring</h3>
                                <p className="text-xs text-muted-foreground">
                                    {isMonitorActive ? "AI detection is active" : "Monitoring is paused"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            {saveStatus === "success" && <CheckCircle2 className="w-4 h-4 text-accent" />}
                            {saveStatus === "error" && <AlertCircle className="w-4 h-4 text-primary" />}
                            <Switch
                                checked={isMonitorActive}
                                onCheckedChange={handleMonitorToggle}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sensitivity Control */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Detection Sensitivity
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence Threshold</span>
                        <span className="font-mono font-medium text-foreground">
                            {Math.round(sensitivity * 100)}%
                        </span>
                    </div>
                    <Slider
                        value={[sensitivity]}
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        onValueChange={handleSensitivityChange}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>More Detections</span>
                        <span>Higher Accuracy</span>
                    </div>
                </CardContent>
            </Card>

            {/* Gear Requirements */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Required PPE
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {GEAR_ITEMS.map((gear) => {
                            const Icon = gear.icon
                            const isActive = activeGear.includes(gear.id)

                            return (
                                <button
                                    key={gear.id}
                                    onClick={() => handleGearToggle(gear.id)}
                                    disabled={isSaving}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${isActive
                                        ? "bg-accent/10 border border-accent/30 hover:bg-accent/20"
                                        : "bg-muted/30 border border-transparent hover:bg-muted/50"
                                        }`}
                                >
                                    <div className={`p-1.5 rounded ${isActive ? "bg-accent/20" : "bg-muted"
                                        }`}>
                                        <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                                            }`}>
                                            {gear.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{gear.description}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive
                                        ? "border-accent bg-accent"
                                        : "border-muted-foreground/30"
                                        }`}>
                                        {isActive && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        {activeGear.length} of {GEAR_ITEMS.length} items required for compliance
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
