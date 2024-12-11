export type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

export type FieldValidation<T extends Record<string, string>> = {
  [K in keyof T]: ValidationRule[];
};

export type ValidationResult = {
  isValid: boolean;
  errors: { [key: string]: string[] };
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

// Common validation rules
export const validationRules = {
  required: (fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message: `${fieldName} is required`,
  }),
  email: {
    test: (value: string) => EMAIL_REGEX.test(value),
    message: "Please enter a valid email address",
  },
  minLength: (length: number): ValidationRule => ({
    test: (value: string) => value.length >= length,
    message: `Must be at least ${length} characters long`,
  }),
  maxLength: (length: number): ValidationRule => ({
    test: (value: string) => value.length <= length,
    message: `Must be no more than ${length} characters long`,
  }),
  hasNumber: {
    test: (value: string) => /\d/.test(value),
    message: "Must contain at least one number",
  },
  hasUpperCase: {
    test: (value: string) => /[A-Z]/.test(value),
    message: "Must contain at least one uppercase letter",
  },
  hasLowerCase: {
    test: (value: string) => /[a-z]/.test(value),
    message: "Must contain at least one lowercase letter",
  },
  hasSpecialChar: {
    test: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
    message: "Must contain at least one special character",
  },
  noCommonPasswords: {
    test: (value: string) => {
      const commonPasswords = ["password", "12345678", "qwerty123"];
      return !commonPasswords.includes(value.toLowerCase());
    },
    message: "This password is too common",
  },
};

// Predefined validation sets
export const validationSets = {
  email: [validationRules.required("Email"), validationRules.email],
  password: [
    validationRules.required("Password"),
    validationRules.minLength(PASSWORD_MIN_LENGTH),
    validationRules.hasNumber,
    validationRules.hasUpperCase,
    validationRules.hasSpecialChar,
    validationRules.noCommonPasswords,
  ],
  name: [
    validationRules.required("Name"),
    validationRules.minLength(2),
    validationRules.maxLength(50),
  ],
};

export function validateField(
  value: string,
  rules: ValidationRule[]
): string[] {
  return rules.filter((rule) => !rule.test(value)).map((rule) => rule.message);
}

export function validateForm<T extends Record<string, string>>(
  values: T,
  validations: FieldValidation<T>
): ValidationResult {
  const errors: { [key: string]: string[] } = {};
  let isValid = true;

  (Object.keys(validations) as Array<keyof T>).forEach((fieldName) => {
    const value = values[fieldName];
    const fieldErrors = validateField(value, validations[fieldName]);

    if (fieldErrors.length > 0) {
      errors[fieldName as string] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}

// Helper function to get password strength
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string;
  color: string;
} {
  let score = 0;
  const checks = [
    { test: (p: string) => p.length >= PASSWORD_MIN_LENGTH, points: 1 },
    { test: (p: string) => /[A-Z]/.test(p), points: 1 },
    { test: (p: string) => /[a-z]/.test(p), points: 1 },
    { test: (p: string) => /\d/.test(p), points: 1 },
    { test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p), points: 1 },
    { test: (p: string) => p.length >= 12, points: 1 },
  ];

  checks.forEach((check) => {
    if (check.test(password)) {
      score += check.points;
    }
  });

  const strengthMap = [
    { score: 0, feedback: "Very weak", color: "text-red-500" },
    { score: 2, feedback: "Weak", color: "text-orange-500" },
    { score: 3, feedback: "Medium", color: "text-yellow-500" },
    { score: 4, feedback: "Strong", color: "text-green-500" },
    { score: 6, feedback: "Very strong", color: "text-green-600" },
  ];

  const strength = strengthMap.reduce((prev, curr) => {
    return score >= curr.score ? curr : prev;
  });

  return {
    score,
    feedback: strength.feedback,
    color: strength.color,
  };
}

// Helper function to debounce validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
