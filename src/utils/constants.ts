// Graph Layout Constants
export const GRAPH_LAYOUT = {
  HIERARCHICAL: {
    LAYER_SPACING: 200,
    NODE_SPACING: 150,
    CENTER_X: 400,
    START_Y: 100,
  },
  FORCE: {
    ITERATIONS: 10,
    REPULSION_FORCE: 1000,
    ATTRACTION_FORCE: 0.01,
    CENTER_X: 400,
    CENTER_Y: 300,
    INITIAL_SPREAD: 400,
  },
  DAGRE: {
    RANK_SEPARATION: 150,
    NODE_SEPARATION: 100,
    EDGE_SEPARATION: 80,
    RANK_DIRECTION: 'TB' as const, // Top to Bottom
  },
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
  RETRY_DELAY_MAX: 10000, // 10 seconds
} as const;

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY_BASE: 2000, // 2 seconds
  RECONNECT_DELAY_MAX: 30000, // 30 seconds
  PING_INTERVAL: 30000, // 30 seconds
  PONG_TIMEOUT: 5000, // 5 seconds
} as const;

// Component Sizes
export const NODE_SIZES = {
  SMALL: {
    MIN_WIDTH: 150,
    MAX_WIDTH: 180,
    PADDING: 12,
  },
  MEDIUM: {
    MIN_WIDTH: 200,
    MAX_WIDTH: 250,
    PADDING: 16,
  },
  LARGE: {
    MIN_WIDTH: 250,
    MAX_WIDTH: 300,
    PADDING: 20,
  },
} as const;

// Animation Durations (milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  BASE: 0,
  DROPDOWN: 1000,
  MODAL: 2000,
  TOOLTIP: 3000,
  NOTIFICATION: 4000,
} as const;

// Cache TTL (milliseconds)
export const CACHE_TTL = {
  SHORT: 60000, // 1 minute
  MEDIUM: 300000, // 5 minutes
  LONG: 900000, // 15 minutes
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10485760, // 10MB
  ALLOWED_TYPES: ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'],
} as const;
