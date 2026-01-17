const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

// ============================================================================
// CORE API REQUEST HELPER
// ============================================================================
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    // Return mock data if API fails (for demo/offline mode)
    return getMockData(endpoint) as T
  }
}

// ============================================================================
// MOCK DATA FOR OFFLINE/DEMO MODE
// ============================================================================
function getMockData(endpoint: string): any {
  const now = new Date()

  if (endpoint === "/api/dashboard/summary" || endpoint === "/api/stats") {
    return {
      activeViolations: 4,
      camerasOnline: 8,
      complianceScore: 87.5,
      averageResponseTime: 2.3,
      total_violations: 4,
      compliance_rate: 87.5,
    }
  }

  if (endpoint.includes("/api/dashboard/violations")) {
    const urlParams = new URL(endpoint, "http://localhost")
    const limit = Number.parseInt(urlParams.searchParams.get("limit") || "5")

    const allViolations = [
      {
        id: "v1",
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        type: "ppe",
        severity: "critical",
        camera: "Camera 1",
        person: "Worker ID: 001",
        description: "Missing hard hat",
        confidence: 0.98,
      },
      {
        id: "v2",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        type: "ppe",
        severity: "warning",
        camera: "Camera 3",
        person: "Worker ID: 045",
        description: "Missing safety goggles",
        confidence: 0.92,
      },
      {
        id: "v3",
        timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
        type: "posture",
        severity: "warning",
        camera: "Camera 5",
        person: "Worker ID: 028",
        description: "Improper lifting posture",
        confidence: 0.85,
      },
      {
        id: "v4",
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        type: "hazard",
        severity: "info",
        camera: "Camera 2",
        person: "Worker ID: 012",
        description: "Hazardous area access",
        confidence: 0.88,
      },
    ]

    return allViolations.slice(0, limit)
  }

  if (endpoint === "/api/monitor/cameras" || endpoint === "/api/cameras") {
    return [
      { id: "cam1", name: "Warehouse Entrance", location: "Main Gate", online: true, violations: 0, zone: "General", source: "0", type: "webcam" },
      { id: "cam2", name: "Assembly Line A", location: "Floor 1", online: true, violations: 2, zone: "General", source: "1", type: "webcam" },
      { id: "cam3", name: "Assembly Line B", location: "Floor 1", online: true, violations: 1, zone: "Production", source: "2", type: "webcam" },
    ]
  }

  if (endpoint.includes("/api/monitor/stream")) {
    return {
      stream_url: "/live-video-feed.jpg",
      camera_id: "cam1",
      status: "active",
    }
  }

  if (endpoint === "/api/logs") {
    return {
      logs: [
        {
          id: "log1",
          timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
          type: "ppe",
          severity: "critical",
          camera: "Camera 1",
          description: "Missing hard hat",
          confidence: 0.98,
          person: "Worker 001",
          status: "VIOLATION",
          missing: ["mask", "gloves"],
        },
        {
          id: "log2",
          timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
          type: "ppe",
          severity: "warning",
          camera: "Camera 3",
          description: "Missing safety goggles",
          confidence: 0.92,
          person: "Worker 045",
          status: "VIOLATION",
          missing: ["glasses"],
        },
        {
          id: "log3",
          timestamp: new Date(now.getTime() - 18 * 60000).toISOString(),
          type: "posture",
          severity: "info",
          camera: "Camera 5",
          description: "All PPE compliant",
          confidence: 0.85,
          person: "Worker 028",
          status: "COMPLIANT",
          missing: [],
        },
      ],
      total: 127,
      page: 1,
    }
  }

  if (endpoint === "/api/monitor/status") {
    return { active: false }
  }

  if (endpoint === "/api/settings/threshold") {
    return { conf: 0.50 }
  }

  if (endpoint === "/api/settings/gear") {
    return { requirements: ["mask", "gloves", "coverall", "goggles", "face_shield"] }
  }

  if (endpoint === "/api/analytics/summary") {
    return {
      totalViolations: 342,
      averageResponseTime: 2.3,
      systemUptime: 99.8,
      complianceScore: 87.5,
      detected: { Mask: 124, Gloves: 98, Goggles: 76, Coverall: 45, "Face Shield": 30 },
      missing: { Mask: 42, Gloves: 35, Goggles: 56, Coverall: 88, "Face Shield": 62 },
    }
  }

  if (endpoint.includes("/api/logs/search")) {
    return getMockData("/api/logs")
  }


  if (endpoint === "/api/analytics/violations-trend") {
    return [
      { date: "Mon", violations: 12 },
      { date: "Tue", violations: 15 },
      { date: "Wed", violations: 8 },
      { date: "Thu", violations: 18 },
      { date: "Fri", violations: 14 },
      { date: "Sat", violations: 5 },
      { date: "Sun", violations: 3 },
    ]
  }

  if (endpoint === "/api/analytics/compliance-score") {
    return [
      { date: "Mon", score: 85 },
      { date: "Tue", score: 84 },
      { date: "Wed", score: 88 },
      { date: "Thu", score: 86 },
      { date: "Fri", score: 87 },
      { date: "Sat", score: 90 },
      { date: "Sun", score: 92 },
    ]
  }

  if (endpoint === "/api/analytics/violations-by-type") {
    return [
      { type: "PPE Violations", count: 185 },
      { type: "Posture Issues", count: 98 },
      { type: "Hazard Access", count: 59 },
    ]
  }

  if (endpoint === "/api/analytics/camera-performance") {
    return [
      { camera: "Cam 1", violations: 25, uptime: 99.8, efficiency: 92 },
      { camera: "Cam 2", violations: 45, uptime: 99.5, efficiency: 88 },
      { camera: "Cam 3", violations: 38, uptime: 99.9, efficiency: 90 },
      { camera: "Cam 5", violations: 52, uptime: 99.2, efficiency: 85 },
      { camera: "Cam 6", violations: 18, uptime: 99.9, efficiency: 94 },
    ]
  }

  if (endpoint === "/api/videos/history") {
    return { history: [] }
  }

  // Fallback structures to prevent .map() crashes
  if (endpoint.includes("history") || endpoint.includes("activity") || endpoint.includes("trend") || endpoint.includes("cameras") || endpoint.includes("logs")) {
    return endpoint.includes("history") || endpoint.includes("logs") ? { logs: [], history: [] } : []
  }

  return {}
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
export interface MonitorStatus {
  active: boolean
}

export interface ThresholdSettings {
  conf: number
}

export interface GearSettings {
  requirements: string[]
}

export interface DetectionLog {
  id: number
  status: "SAFE" | "VIOLATION"
  missing: string[]
  detected: string[]
  timestamp: string
  source: string
}

export interface StatsResponse {
  total_violations: number
  compliance_rate: number
}

export interface VideoAnalysisResult {
  status: string
  video_url: string
  total_frames: number
  logs: DetectionLog[]
}

// ============================================================================
// SAFETY MONITOR API - Core Backend Integration
// ============================================================================
export const safetyMonitorAPI = {
  // --- Monitoring Control ---
  getMonitorStatus: (): Promise<MonitorStatus> =>
    apiRequest<MonitorStatus>("/api/monitor/status"),

  toggleMonitor: (active: boolean): Promise<{ status: string; active: boolean }> =>
    apiRequest("/api/monitor/toggle", {
      method: "POST",
      body: JSON.stringify({ active }),
    }),

  // --- Threshold/Sensitivity Settings ---
  getThreshold: (): Promise<ThresholdSettings> =>
    apiRequest<ThresholdSettings>("/api/settings/threshold"),

  setThreshold: (conf: number): Promise<{ status: string; new_conf: number }> =>
    apiRequest("/api/settings/threshold", {
      method: "POST",
      body: JSON.stringify({ conf }),
    }),

  // --- Gear Requirements Settings ---
  getGearSettings: (): Promise<GearSettings> =>
    apiRequest<GearSettings>("/api/settings/gear"),

  setGearSettings: (requirements: string[]): Promise<{ status: string; active: string[] }> =>
    apiRequest("/api/settings/gear", {
      method: "POST",
      body: JSON.stringify({ requirements }),
    }),

  // --- Logs & Statistics ---
  getLogs: (): Promise<{ logs: DetectionLog[] }> =>
    apiRequest<{ logs: DetectionLog[] }>("/api/logs"),

  getStats: (): Promise<StatsResponse> =>
    apiRequest<StatsResponse>("/api/stats"),

  // --- Live Video Feed URL ---
  // --- Live Video Feed URL ---
  getVideoFeedUrl: (camId: string): string => `${API_BASE_URL}/video_feed/${camId}`,

  // --- Multi-Camera API ---
  getCameras: (): Promise<CameraConfig[]> => apiRequest<CameraConfig[]>("/api/cameras"),
  addCamera: (config: CameraConfig): Promise<{ status: string, camera: CameraConfig }> =>
    apiRequest<{ status: string, camera: CameraConfig }>("/api/cameras", { method: "POST", body: JSON.stringify(config) }),
  deleteCamera: (id: string): Promise<{ status: string }> =>
    apiRequest<{ status: string }>(`/api/cameras/${id}`, { method: "DELETE" }),

  // --- Video Upload & Analysis ---
  analyzeVideo: async (file: File, startTime: number = 0, endTime?: number, requiredGear?: string[]): Promise<VideoAnalysisResult> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("start_time", startTime.toString())
    if (endTime !== undefined) {
      formData.append("end_time", endTime.toString())
    }
    if (requiredGear && requiredGear.length > 0) {
      formData.append("required_gear", JSON.stringify(requiredGear))
    }

    try {
      const response = await fetch(`${API_BASE_URL}/analyze_video`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error("Video analysis failed:", error)
      throw error
    }
  },

  getVideoHistory: (): Promise<{ history: VideoHistoryItem[] }> =>
    apiRequest<{ history: VideoHistoryItem[] }>("/api/videos/history"),

  // Helper to get full static video URL
  getStaticVideoUrl: (relativePath: string): string => `${API_BASE_URL}${relativePath}`,
}

export interface CameraConfig {
  id?: string
  name: string
  source: string
  type: 'webcam' | 'ip'
  zone?: string
}

export interface VideoHistoryItem {
  filename: string
  url: string
  thumbnail_url?: string
  timestamp: number
  violations: number
  total_detections: number
}

// ============================================================================
// DASHBOARD API (Enhanced with Backend Stats)
// ============================================================================
export const dashboardAPI = {
  getSummary: () => apiRequest("/api/dashboard/summary"),
  getViolations: (limit = 5) => apiRequest(`/api/dashboard/violations?limit=${limit}`),
  getSystemStatus: () => apiRequest("/api/dashboard/system-status"),
  getRecentActivity: (limit = 4) => apiRequest(`/api/dashboard/activity?limit=${limit}`),
  // Use backend stats when available
  getBackendStats: () => safetyMonitorAPI.getStats(),
}

// ============================================================================
// MONITORING API
// ============================================================================
export const monitorAPI = {
  getCameras: () => safetyMonitorAPI.getCameras(),
  addCamera: (config: CameraConfig) => safetyMonitorAPI.addCamera(config),
  deleteCamera: (id: string) => safetyMonitorAPI.deleteCamera(id),
  getLiveFeedUrl: (camId: string) => safetyMonitorAPI.getVideoFeedUrl(camId),
  getMonitorStatus: () => safetyMonitorAPI.getMonitorStatus(),
  toggleMonitor: (active: boolean) => safetyMonitorAPI.toggleMonitor(active),
}

// ============================================================================
// LOGS API
// ============================================================================
export const logsAPI = {
  getLogs: (filters?: {
    severity?: string
    type?: string
    camera?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // Map some UI filters to backend fields
          if (key === "startDate") params.append("start", String(value))
          else if (key === "endDate") params.append("end", String(value))
          else params.append(key, String(value))
        }
      })
    }
    return apiRequest(`/api/logs/search?${params.toString()}`)
  },
  getLog: (id: string) => apiRequest(`/api/logs/${id}`),
  exportLogs: (format = "csv") => apiRequest(`/api/logs/export?format=${format}`),
  // Backend logs (simplified structure from safety monitor)
  getBackendLogs: () => safetyMonitorAPI.getLogs(),
}

// ============================================================================
// SETTINGS API
// ============================================================================
export const settingsAPI = {
  getThreshold: () => safetyMonitorAPI.getThreshold(),
  setThreshold: (conf: number) => safetyMonitorAPI.setThreshold(conf),
  getGearSettings: () => safetyMonitorAPI.getGearSettings(),
  setGearSettings: (requirements: string[]) => safetyMonitorAPI.setGearSettings(requirements),
}

// ============================================================================
// ANALYTICS API
// ============================================================================
export const analyticsAPI = {
  getSummary: () => apiRequest("/api/analytics/summary"),
  getViolationsTrend: (timeRange: string) => apiRequest(`/api/analytics/violations-trend?range=${timeRange}`),
  getComplianceScore: (timeRange: string) => apiRequest(`/api/analytics/compliance-score?range=${timeRange}`),
  getViolationsByType: () => apiRequest("/api/analytics/violations-by-type"),
  getCameraPerformance: () => apiRequest("/api/analytics/camera-performance"),
}

// ============================================================================
// WEBSOCKET CONNECTION (For Real-time Updates)
// ============================================================================
export function createWebSocketConnection(url: string) {
  const wsUrl = `${API_BASE_URL.replace("http", "ws")}${url}`
  return new WebSocket(wsUrl)
}

export function subscribeToViolations(cameraId: string, onViolation: (violation: any) => void) {
  const ws = createWebSocketConnection(`/api/ws/violations/${cameraId}`)

  ws.onmessage = (event) => {
    const violation = JSON.parse(event.data)
    onViolation(violation)
  }

  ws.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  return ws
}

// ============================================================================
// API BASE URL EXPORT (for direct access in components)
// ============================================================================
export { API_BASE_URL }
