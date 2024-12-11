"use client";

import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ComponentType,
  createElement,
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type UseAuthOptions = {
  required?: boolean;
  redirectTo?: string;
  onError?: (error: string) => void;
};

export type AuthResult = {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  user: Session["user"] | null;
};

export function useAuth(options: UseAuthOptions = {}): AuthResult {
  const { data: session, status } = useSession();
  console.log(session, status);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (isLoading) return;

    if (options.required && !isAuthenticated) {
      router.push(options.redirectTo || "/login");
    }

    if (isAuthenticated && options.redirectTo && !options.required) {
      router.push(options.redirectTo);
    }
  }, [isAuthenticated, isLoading, options, router]);

  useEffect(() => {
    if (error && options.onError) {
      options.onError(error);
    }
  }, [error, options]);

  return {
    session,
    isLoading,
    isAuthenticated,
    error,
    setError,
    user: session?.user || null,
  };
}

export type AuthGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
  loading?: ReactNode;
}> &
  UseAuthOptions;

export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  fallback,
  loading,
  ...options
}) => {
  const { isAuthenticated, isLoading } = useAuth(options);

  if (isLoading) {
    return (loading as ReactElement) || null;
  }

  if (!isAuthenticated) {
    return (fallback as ReactElement) || null;
  }

  return children as ReactElement;
};

export function useRedirectIfAuthenticated(redirectTo: string = "/"): {
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isLoading };
}

export function useRedirectIfUnauthenticated(redirectTo: string = "/login"): {
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isLoading };
}

export type AuthGuardHookResult = AuthResult & {
  isReady: boolean;
};

export function useAuthGuard(
  options: UseAuthOptions = {}
): AuthGuardHookResult {
  const auth = useAuth(options);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth.isLoading) {
      setIsReady(true);
    }
  }, [auth.isLoading]);

  return {
    ...auth,
    isReady,
  };
}

export interface WithAuthProps {
  auth: AuthResult;
}

type RemoveAuthProp<P extends WithAuthProps> = Omit<P, keyof WithAuthProps>;

export function withAuth<P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>
): FC<RemoveAuthProp<P>> {
  return function WithAuthComponent(
    props: RemoveAuthProp<P>
  ): ReactElement | null {
    const auth = useAuth();

    if (auth.isLoading) {
      return null;
    }

    const componentProps = {
      ...props,
      auth,
    } as P;

    return createElement(WrappedComponent, componentProps);
  };
}

// Helper function to check if a component is wrapped with withAuth
export function isAuthComponent<P extends WithAuthProps>(
  Component: ComponentType<any>
): Component is FC<RemoveAuthProp<P>> {
  return !!(
    Component &&
    typeof Component === "function" &&
    Component.displayName?.startsWith("withAuth(")
  );
}

// Helper function to create a protected page component
export function createProtectedPage<P extends WithAuthProps>(
  PageComponent: ComponentType<P>,
  options: UseAuthOptions = { required: true }
): FC<RemoveAuthProp<P>> {
  const ProtectedComponent = withAuth<P>(PageComponent);

  return function ProtectedPage(props: RemoveAuthProp<P>): ReactElement | null {
    const auth = useAuth(options);

    if (auth.isLoading) {
      return null;
    }

    return createElement(ProtectedComponent, props);
  };
}
