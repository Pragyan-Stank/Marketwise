"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Video,
    Globe,
    Plus,
    MonitorSmartphone
} from "lucide-react"

interface AddCameraModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (config: { name: string, source: string, type: 'webcam' | 'ip', zone: string }) => void
}

export function AddCameraModal({ isOpen, onClose, onAdd }: AddCameraModalProps) {
    const [name, setName] = useState("")
    const [source, setSource] = useState("0")
    const [type, setType] = useState<'webcam' | 'ip'>('webcam')
    const [zone, setZone] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onAdd({ name, source, type, zone: zone || "General" })
        setName("")
        setSource("0")
        setZone("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Add New Camera
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Method Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setType('webcam')
                                setSource("0")
                            }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'webcam'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-muted/30 hover:border-border/80'
                                }`}
                        >
                            <Video className={`w-6 h-6 ${type === 'webcam' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-bold">Local Webcam</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType('ip')}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${type === 'ip'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-muted/30 hover:border-border/80'
                                }`}
                        >
                            <Globe className={`w-6 h-6 ${type === 'ip' ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-xs font-bold">IP Camera / URL</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Camera Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Zone A - North Entry"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="source">
                                {type === 'webcam' ? 'Camera Index (Default: 0)' : 'IP URL (e.g. http://192.168.1.5:8080/video)'}
                            </Label>
                            <Input
                                id="source"
                                placeholder={type === 'webcam' ? "0" : "http://..."}
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                required
                                className="bg-muted/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="zone">Placement Zone (Optional)</Label>
                            <Input
                                id="zone"
                                placeholder="e.g. Warehouse, Office"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                className="bg-muted/50"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">Add to Monitor</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
