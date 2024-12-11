import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { authErrors } from "@/lib/auth-errors";
import {
  ApiError,
  createRateLimitMiddleware,
  handleApiRoute,
  validateRequestBody,
} from "@/lib/api-response";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const rateLimitMiddleware = createRateLimitMiddleware(30, 60000); // 30 requests per minute

// Password validation helper
export function validatePassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: authErrors.WeakPassword.message,
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character",
    };
  }

  return { isValid: true };
}

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    // Apply rate limiting
    rateLimitMiddleware(req);

    const body = await req.json();

    // Validate required fields
    validateRequestBody(body, ["email", "password"]);
    const { email, password } = body;

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(authErrors.InvalidEmail.message, 400, "INVALID_EMAIL");
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(
        passwordValidation.error || authErrors.WeakPassword.message,
        400,
        "INVALID_PASSWORD"
      );
    }

    // Check for common passwords
    const commonPasswords = ["password", "12345678", "qwerty123"];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new ApiError(
        "Please choose a stronger password",
        400,
        "COMMON_PASSWORD"
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(authErrors.UserExists.message, 400, "USER_EXISTS");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });

    return {
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    };
  });
}

// Add OPTIONS handler for CORS support
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// Helper function to validate registration data
export function validateRegistrationData(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const errors: string[] = [];

  if (!EMAIL_REGEX.test(data.email)) {
    errors.push(authErrors.InvalidEmail.message);
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.error || authErrors.WeakPassword.message);
  }

  if (data.name && data.name.length > 50) {
    errors.push("Name must be less than 50 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
