import { z } from 'zod';
import { logger } from '@utils/logger';

// Environment variable schema
const envSchema = z.object({
  // API Configuration
  VITE_API_BASE_URL: z.string().url().optional().default('http://localhost:3001'),
  VITE_WS_BASE_URL: z.string().optional(),

  // Feature Flags
  VITE_ENABLE_WEBSOCKET: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  VITE_ENABLE_CACHING: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),

  // Application Configuration
  VITE_APP_NAME: z.string().optional().default('ADAPT-UI'),
  VITE_APP_VERSION: z.string().optional().default('1.0.0'),
  VITE_ENV: z.enum(['development', 'staging', 'production']).optional().default('development'),

  // Debug Configuration
  VITE_DEBUG: z
    .string()
    .optional()
    .default('false')
    .transform((val) => val === 'true'),
  VITE_LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .optional()
    .default('info'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    const env = {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
      VITE_ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET,
      VITE_ENABLE_CACHING: import.meta.env.VITE_ENABLE_CACHING,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
      VITE_ENV: import.meta.env.VITE_ENV || import.meta.env.MODE,
      VITE_DEBUG: import.meta.env.VITE_DEBUG,
      VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
    };

    return envSchema.parse(env);
  } catch (error) {
    logger.error('Failed to parse environment variables', error);
    throw error;
  }
};

const env = parseEnv();

// Derived configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: env.VITE_API_BASE_URL,
    wsUrl: env.VITE_WS_BASE_URL || env.VITE_API_BASE_URL.replace('http', 'ws'),
  },

  // Feature Flags
  features: {
    websocket: env.VITE_ENABLE_WEBSOCKET,
    caching: env.VITE_ENABLE_CACHING,
    analytics: env.VITE_ENABLE_ANALYTICS,
  },

  // Application Info
  app: {
    name: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
    environment: env.VITE_ENV,
  },

  // Debug Configuration
  debug: {
    enabled: env.VITE_DEBUG,
    logLevel: env.VITE_LOG_LEVEL,
  },

  // Environment checks
  isDevelopment: env.VITE_ENV === 'development',
  isStaging: env.VITE_ENV === 'staging',
  isProduction: env.VITE_ENV === 'production',
} as const;

// Log configuration in development
if (config.isDevelopment && config.debug.enabled) {
  logger.debug('Application configuration', { config });
}

export default config;
