export interface Person {
  id: string
  name: string
  detectionId: string
  ppeStatus: {
    helmet: boolean
    shoes: boolean
    goggles: boolean
    mask: boolean
  }
  confidence: number
}

export interface Detection {
  id: string
  timestamp: string
  camera_id: string
  persons: Person[]
  detection_type: "ppe" | "posture" | "hazard"
  severity: "critical" | "warning" | "info"
  description: string
  confidence: number
}

export interface Violation {
  id: string
  type: string
  severity: "critical" | "warning" | "info"
  camera: string
  timestamp: string
  person: string
  confidence: number
  description: string
}

export interface Camera {
  id: string
  name: string
  location: string
  online: boolean
  violations: number
  uptime: number
  lastSeen: string
}

export interface DetectionLog {
  id: string
  timestamp: string
  type: string
  severity: "critical" | "warning" | "info"
  camera: string
  description: string
  confidence: number
  person?: string
}

export interface SystemStatus {
  name: string
  status: "operational" | "warning" | "error"
  detail: string
  lastCheck?: string
}

export interface DashboardStats {
  activeViolations: number
  camerasOnline: number
  complianceScore: number
  averageResponseTime: number
}

export interface AnalyticsData {
  violationTrend: Array<{ day: string; violations: number }>
  complianceScore: Array<{ day: string; score: number }>
  violationByType: Array<{ type: string; count: number }>
  cameraPerformance: Array<{ camera: string; violations: number; uptime: number; efficiency: number }>
}

export interface ActivityItem {
  id: string
  type: "violation" | "resolution" | "system"
  message: string
  timestamp: string
}
