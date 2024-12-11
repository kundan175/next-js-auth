import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authErrors } from "./auth-errors";

export type AuthenticatedPage = {
  isProtected?: boolean;
  redirectTo?: string;
  requireAdmin?: boolean;
};

export async function getAuthSession() {
  return await getServerSession();
}

export async function checkAuth(
  options: AuthenticatedPage = { isProtected: false }
) {
  const session = await getAuthSession();

  if (options.isProtected && !session) {
    redirect(options.redirectTo || "/login");
  }

  if (session && !options.isProtected && options.redirectTo) {
    redirect(options.redirectTo);
  }

  return session;
}

export function validateSession(session: any) {
  if (!session) {
    throw new Error(authErrors.Unauthorized.message);
  }

  if (!session.user?.email) {
    throw new Error(authErrors.SessionRequired.message);
  }

  return session;
}

export async function withAuth<T>(
  handler: (session: any) => Promise<T>,
  options: AuthenticatedPage = { isProtected: true }
): Promise<T> {
  try {
    const session = await getAuthSession();

    if (options.isProtected) {
      validateSession(session);
    }

    return await handler(session);
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

export function isAdmin(session: any): boolean {
  return session?.user?.role === "admin";
}

export async function checkAdminAuth() {
  const session = await getAuthSession();

  if (!session || !isAdmin(session)) {
    redirect("/unauthorized");
  }

  return session;
}

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
};

export function getSessionUser(session: any): SessionUser | null {
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name || null,
    image: session.user.image || null,
    role: session.user.role || "user",
  };
}

// Helper to check if user has required permissions
export function hasPermission(
  session: any,
  requiredPermissions: string[]
): boolean {
  const user = getSessionUser(session);
  if (!user) return false;

  // Admin has all permissions
  if (user.role === "admin") return true;

  // Add your permission logic here
  // For example, checking against a user's permissions array
  return false;
}
