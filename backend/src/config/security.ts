// src/config/security.ts
export const securityConfig = {
  // Error handling
  errorHandling: {
    // Whether to log error stack traces (for debugging)
    logStackTraces: process.env.NODE_ENV === 'development',

    // Whether to include request details in error logs
    logRequestDetails: true,

    // Whether to include user information in error logs
    logUserDetails: true,

    // Maximum length of error messages sent to client
    maxErrorMessageLength: 200,

    // Generic error message for unknown errors
    genericErrorMessage: 'An unexpected error occurred. Please try again later.',
  },

  // Request logging
  requestLogging: {
    // Whether to log all requests
    enabled: process.env.NODE_ENV === 'development',

    // Fields to exclude from request logging
    excludeFields: ['password', 'token', 'authorization'],

    // Maximum request body size to log (in bytes)
    maxBodyLogSize: 1024,
  },

  // Sensitive headers to mask in logs
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
  ],
};