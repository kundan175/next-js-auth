"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import ErrorMessage from "./ErrorMessage";
import Loading from "./Loading";
import Link from "next/link";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { formatAuthError } from "@/lib/auth-errors";
import {
  validateForm as validateFormFields,
  validationSets,
  debounce,
  ValidationResult,
  FieldValidation,
} from "@/lib/form-validation";

interface AuthFormProps {
  mode: "signin" | "signup";
}

type FormFields = {
  email: string;
  password: string;
  [key: string]: string;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState<FormFields>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const debouncedValidate = useCallback(
    (field: keyof FormFields, value: string) => {
      const validationRules: FieldValidation<FormFields> = {
        [field]: validationSets[field as keyof typeof validationSets],
      } as FieldValidation<FormFields>;

      const result = validateFormFields(
        { ...formData, [field]: value },
        validationRules
      );
      setErrors((prev) => ({
        ...prev,
        [field]: result.errors[field] || [],
      }));
    },
    [formData]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    debouncedValidate(name as keyof FormFields, value);
  };

  const validateForm = (): boolean => {
    const validationRules: FieldValidation<FormFields> = {
      email: validationSets.email,
      password:
        mode === "signup"
          ? validationSets.password
          : [validationSets.password[0]],
    };

    const result: ValidationResult = validateFormFields(
      formData,
      validationRules
    );
    setErrors(result.errors);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error(signInResult.error);
        }

        router.push("/protected");
      } else {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push("/protected");
      }
    } catch (error) {
      const formattedError = formatAuthError(error);
      setErrors({
        form: [formattedError],
      });

      setTimeout(() => {
        setErrors((prev) => {
          const { form, ...rest } = prev;
          return rest;
        });
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: "/protected" });
    } catch (error) {
      setErrors({
        form: [formatAuthError(error)],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-3 text-gray-600">
              {mode === "signin" ? (
                <>
                  New here?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Create an account
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.form && (
              <div className="animate-fadeIn">
                <ErrorMessage message={errors.form[0]} />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                    errors?.email?.length ? "border-red-300" : "border-gray-300"
                  } bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors?.email?.length && (
                  <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  className={`mt-1 block w-full px-4 py-3 rounded-xl border ${
                    errors?.password?.length
                      ? "border-red-300"
                      : "border-gray-300"
                  } bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
                {errors?.password?.length && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password[0]}
                  </p>
                )}
              </div>
            </div>

            {mode === "signup" && formData.password && (
              <PasswordStrengthMeter password={formData.password} />
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                (errors?.password?.length ?? 0) > 0 ||
                (errors?.email?.length ?? 0) > 0
              }
              className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02]"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Sign up"
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform transition-all duration-200 hover:scale-[1.02]"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                />
                <span className="text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignIn("facebook")}
                className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transform transition-all duration-200 hover:scale-[1.02]"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.facebook.com/favicon.ico"
                  alt="Facebook"
                />
                <span className="text-sm font-medium text-gray-700">
                  Facebook
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
