export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

export const DETECTION_MODES = {
  PPE: "ppe",
  POSTURE: "posture",
  HAZARD: "hazard",
} as const

export const SEVERITY_LEVELS = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
} as const

export const CAMERA_STATUSES = {
  ONLINE: "online",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
} as const

export const SYSTEM_STATUS_CHECKS = {
  VIDEO_PROCESSING: "video_processing",
  AI_MODEL: "ai_model",
  DATABASE: "database",
  ALERT_SYSTEM: "alert_system",
} as const
