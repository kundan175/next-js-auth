import { getPasswordStrength } from "@/lib/form-validation";
import { useEffect, useState } from "react";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthMeter({
  password,
  className = "",
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState({
    score: 0,
    feedback: "",
    color: "",
  });

  useEffect(() => {
    if (password) {
      setStrength(getPasswordStrength(password));
    } else {
      setStrength({ score: 0, feedback: "", color: "" });
    }
  }, [password]);

  if (!password) {
    return null;
  }

  const segments = [
    { width: "20%", color: "bg-red-500" },
    { width: "40%", color: "bg-orange-500" },
    { width: "60%", color: "bg-yellow-500" },
    { width: "80%", color: "bg-green-500" },
    { width: "100%", color: "bg-green-600" },
  ];

  const currentSegment = Math.min(
    Math.floor((strength.score / 6) * segments.length),
    segments.length - 1
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Password Strength
        </span>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.feedback}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${segments[currentSegment].color} transition-all duration-300`}
          style={{ width: segments[currentSegment].width }}
        />
      </div>
      <div className="text-xs text-gray-500">
        <ul className="list-disc pl-5 space-y-1">
          <li className={password.length >= 8 ? "text-green-600" : ""}>
            At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
            One uppercase letter
          </li>
          <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
            One lowercase letter
          </li>
          <li className={/\d/.test(password) ? "text-green-600" : ""}>
            One number
          </li>
          <li
            className={
              /[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : ""
            }
          >
            One special character
          </li>
          <li className={password.length >= 12 ? "text-green-600" : ""}>
            12+ characters (recommended)
          </li>
        </ul>
      </div>
    </div>
  );
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

export function PasswordRequirements({
  password,
  className = "",
}: PasswordRequirementsProps) {
  const requirements = [
    {
      test: (p: string) => p.length >= 8,
      text: "At least 8 characters",
    },
    {
      test: (p: string) => /[A-Z]/.test(p),
      text: "One uppercase letter",
    },
    {
      test: (p: string) => /[a-z]/.test(p),
      text: "One lowercase letter",
    },
    {
      test: (p: string) => /\d/.test(p),
      text: "One number",
    },
    {
      test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
      text: "One special character",
    },
  ];

  return (
    <div className={`text-sm ${className}`}>
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            {req.test(password) ? (
              <svg
                className="h-4 w-4 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-gray-300"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span
              className={`${
                req.test(password) ? "text-green-600" : "text-gray-500"
              }`}
            >
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
