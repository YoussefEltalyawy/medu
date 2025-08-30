// Comprehensive error handling utilities

export enum ERROR_CODES {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  CONTENT_LOAD_ERROR = 'CONTENT_LOAD_ERROR',
  SEARCH_ERROR = 'SEARCH_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError extends Error {
  code: ERROR_CODES;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
  originalError?: Error;
  retryable: boolean;
  source: string;
}

export class AppError extends Error implements AppError {
  code: ERROR_CODES;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
  originalError?: Error;
  retryable: boolean;
  source: string;

  constructor(
    message: string,
    code: ERROR_CODES = ERROR_CODES.UNKNOWN_ERROR,
    context?: Record<string, any>,
    source: string = 'unknown',
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.originalError = originalError;
    this.source = source;
    this.userMessage = getUserFriendlyMessage(code, message);
    this.retryable = isRetryable(code);
  }
}

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ERROR_CODES[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.API_ERROR,
    ERROR_CODES.CONTENT_LOAD_ERROR,
    ERROR_CODES.SEARCH_ERROR,
    ERROR_CODES.TIMEOUT_ERROR
  ]
};

// Determine if an error is retryable
export function isRetryable(code: ERROR_CODES): boolean {
  return DEFAULT_RETRY_CONFIG.retryableErrors.includes(code);
}

// Get user-friendly error messages
export function getUserFriendlyMessage(code: ERROR_CODES, originalMessage?: string): string {
  const messages: Record<ERROR_CODES, string> = {
    [ERROR_CODES.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection and try again.',
    [ERROR_CODES.API_ERROR]: 'Service temporarily unavailable. Please try again in a moment.',
    [ERROR_CODES.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ERROR_CODES.API_UNAUTHORIZED]: 'API access denied. Please check your configuration.',
    [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication required. Please log in and try again.',
    [ERROR_CODES.CONTENT_LOAD_ERROR]: 'Failed to load content. Please try again.',
    [ERROR_CODES.SEARCH_ERROR]: 'Search failed. Please try again with different terms.',
    [ERROR_CODES.DATABASE_ERROR]: 'Data storage issue. Please try again.',
    [ERROR_CODES.VALIDATION_ERROR]: 'Invalid input. Please check your data and try again.',
    [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'Something went wrong. Please try again.'
  };

  return messages[code] || originalMessage || 'An unexpected error occurred.';
}

// Retry function with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName: string = 'operation'
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      const appError = error instanceof AppError ? error : new AppError(
        error instanceof Error ? error.message : 'Unknown error',
        ERROR_CODES.UNKNOWN_ERROR,
        { attempt, operationName },
        operationName,
        error instanceof Error ? error : undefined
      );

      // Don't retry if not retryable or if this is the last attempt
      if (!appError.retryable || attempt === config.maxAttempts) {
        throw appError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      console.warn(`${operationName} failed (attempt ${attempt}/${config.maxAttempts}). Retrying in ${delay}ms...`, {
        error: appError.message,
        code: appError.code
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Error classification helper
export function classifyError(error: unknown, source: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('NetworkError')) {
      return new AppError(error.message, ERROR_CODES.NETWORK_ERROR, {}, source, error);
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return new AppError(error.message, ERROR_CODES.TIMEOUT_ERROR, {}, source, error);
    }

    // API errors (based on HTTP status codes in message)
    if (error.message.includes('400') || error.message.includes('404') || error.message.includes('500')) {
      return new AppError(error.message, ERROR_CODES.API_ERROR, {}, source, error);
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('403') || error.message.includes('unauthorized')) {
      return new AppError(error.message, ERROR_CODES.AUTHENTICATION_ERROR, {}, source, error);
    }

    // Database errors
    if (error.message.includes('database') || error.message.includes('supabase')) {
      return new AppError(error.message, ERROR_CODES.DATABASE_ERROR, {}, source, error);
    }

    // Default to unknown error
    return new AppError(error.message, ERROR_CODES.UNKNOWN_ERROR, {}, source, error);
  }

  // Handle non-Error objects
  const message = typeof error === 'string' ? error : 'Unknown error occurred';
  return new AppError(message, ERROR_CODES.UNKNOWN_ERROR, { originalError: error }, source);
}

// Error reporting (for analytics/logging)
export function reportError(error: AppError): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('AppError:', {
      message: error.message,
      code: error.code,
      source: error.source,
      context: error.context,
      timestamp: error.timestamp,
      stack: error.stack
    });
  }

  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error);
  // }
}

// Circuit breaker pattern for preventing cascading failures
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new AppError(
          'Service temporarily unavailable',
          ERROR_CODES.API_ERROR,
          { circuitBreakerState: 'OPEN' },
          operationName
        );
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

// Global circuit breaker instances
export const contentServiceCircuitBreaker = new CircuitBreaker(5, 60000);
export const searchServiceCircuitBreaker = new CircuitBreaker(3, 30000);

// Timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AppError(
          `${operationName} timed out after ${timeoutMs}ms`,
          ERROR_CODES.TIMEOUT_ERROR,
          { timeoutMs },
          operationName
        ));
      }, timeoutMs);
    })
  ]);
}