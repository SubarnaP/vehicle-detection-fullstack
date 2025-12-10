// Token name for localStorage/cookies
export const TOKEN_NAME = "vehicle_monitor_token";

// API base URL
export const API_BASE = "/api";

// User roles
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

// Upload directory
export const UPLOAD_DIR = "public/uploads";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;

// Detection sources
export const DETECTION_SOURCES = {
  CAMERA: "camera",
  MANUAL: "manual",
} as const;
