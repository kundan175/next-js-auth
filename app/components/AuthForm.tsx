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

      // Clear form error after 5 seconds
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === "signin"
              ? "Sign in to your account"
              : "Create an account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === "signin" ? (
              <>
                Or{" "}
                <Link
                  href="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  create a new account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="animate-fadeIn">
              <ErrorMessage message={errors.form[0]} />
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-t-md relative block w-full px-3 py-2 border ${
                  errors?.email?.length ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors?.email?.length && (
                <p className="mt-1 text-xs text-red-600">{errors.email[0]}</p>
              )}
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
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
                className={`appearance-none rounded-b-md relative block w-full px-3 py-2 border ${
                  errors?.password?.length
                    ? "border-red-300"
                    : "border-gray-300"
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                    className="h-5 w-5 text-gray-400"
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.password[0]}
                </p>
              )}
            </div>
          </div>

          {mode === "signup" && formData.password && (
            <PasswordStrengthMeter password={formData.password} />
          )}

          <div>
            <button
              type="submit"
              disabled={
                isLoading ||
                (errors?.password?.length ?? 0) > 0 ||
                (errors?.email?.length ?? 0) > 0
              }
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
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
                </span>
              )}
              {mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.google.com/favicon.ico"
                alt="Google"
              />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn("facebook")}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.facebook.com/favicon.ico"
                alt="Facebook"
              />
              Continue with Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
