import { NextResponse } from "next/server";
import { authErrors, formatAuthError } from "./auth-errors";

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function createErrorResponse(
  error: unknown,
  status: number = 400
): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Check if it's an auth error
    const authError = formatAuthError(error);
    if (authError !== authErrors.Default.message) {
      return NextResponse.json(
        {
          success: false,
          error: authError,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred",
    },
    { status: 500 }
  );
}

export async function handleApiRoute<T>(
  handler: () => Promise<T>,
  errorStatus: number = 400
): Promise<NextResponse> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    console.error("API Error:", error);
    return createErrorResponse(error, errorStatus);
  }
}

export function validateRequestBody(body: any, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new ApiError(`${field} is required`, 400, "MISSING_FIELD");
    }
  }
}

export function validateQueryParams(
  params: URLSearchParams,
  requiredParams: string[]
): void {
  for (const param of requiredParams) {
    if (!params.has(param)) {
      throw new ApiError(
        `Missing required query parameter: ${param}`,
        400,
        "MISSING_PARAM"
      );
    }
  }
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  errorMessage: string = "An error occurred"
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    console.error(errorMessage, error);
    throw new ApiError(
      error instanceof Error ? error.message : errorMessage,
      500,
      "INTERNAL_ERROR"
    );
  }
}

export function rateLimit(
  requestsPerMinute: number = 60,
  windowMs: number = 60000
): (ip: string) => boolean {
  const requests = new Map<string, number[]>();

  return (ip: string): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this IP
    const userRequests = requests.get(ip) || [];

    // Filter out old requests
    const recentRequests = userRequests.filter((time) => time > windowStart);

    // Check if user has exceeded rate limit
    if (recentRequests.length >= requestsPerMinute) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    requests.set(ip, recentRequests);

    return true;
  };
}

// Example usage of rate limiting middleware
export function createRateLimitMiddleware(
  requestsPerMinute: number = 60,
  windowMs: number = 60000
) {
  const isAllowed = rateLimit(requestsPerMinute, windowMs);

  return function rateLimitMiddleware(req: Request) {
    // Get IP from request headers or use a default
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!isAllowed(ip)) {
      throw new ApiError(
        "Too many requests, please try again later",
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }
  };
}
