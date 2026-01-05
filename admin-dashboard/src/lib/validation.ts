// Form Validation Utilities for Admin Dashboard

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  min?: number;
  max?: number;
  email?: boolean;
  url?: boolean;
  custom?: (value: unknown) => string | null;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: FieldValidation;
};

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;

// Validate a single field
export function validateField(
  value: unknown,
  fieldName: string,
  rules: FieldValidation
): string | null {
  const stringValue = String(value ?? "").trim();
  const numericValue = Number(value);

  // Required check
  if (rules.required) {
    if (value === null || value === undefined || stringValue === "") {
      return `${fieldName} is required`;
    }
  }

  // Skip other validations if empty and not required
  if (!stringValue && !rules.required) {
    return null;
  }

  // Min length
  if (rules.minLength !== undefined && stringValue.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }

  // Max length
  if (rules.maxLength !== undefined && stringValue.length > rules.maxLength) {
    return `${fieldName} must be no more than ${rules.maxLength} characters`;
  }

  // Pattern match
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return rules.patternMessage || `${fieldName} format is invalid`;
  }

  // Email validation
  if (rules.email && stringValue && !EMAIL_REGEX.test(stringValue)) {
    return `${fieldName} must be a valid email address`;
  }

  // URL validation
  if (rules.url && stringValue && !URL_REGEX.test(stringValue)) {
    return `${fieldName} must be a valid URL`;
  }

  // Numeric min
  if (rules.min !== undefined && numericValue < rules.min) {
    return `${fieldName} must be at least ${rules.min}`;
  }

  // Numeric max
  if (rules.max !== undefined && numericValue > rules.max) {
    return `${fieldName} must be no more than ${rules.max}`;
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
}

// Validate entire form
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    if (rules) {
      const fieldLabel = formatFieldName(field);
      const error = validateField(data[field], fieldLabel, rules);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Convert camelCase field names to readable labels
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Common validation schemas
export const systemSettingsValidation: ValidationSchema<{
  siteName: string;
  supportEmail: string;
  siteDescription: string;
  maintenanceMessage: string;
  sessionTimeout: number;
  maxLoginAttempts: number;
  taxRate: number;
  maxFileUploadSize: number;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  emailFromName: string;
  emailFromAddress: string;
}> = {
  siteName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  supportEmail: {
    required: true,
    email: true,
  },
  siteDescription: {
    maxLength: 500,
  },
  maintenanceMessage: {
    maxLength: 500,
  },
  sessionTimeout: {
    required: true,
    min: 1,
    max: 720, // 30 days in hours
  },
  maxLoginAttempts: {
    required: true,
    min: 1,
    max: 20,
  },
  taxRate: {
    min: 0,
    max: 100,
  },
  maxFileUploadSize: {
    required: true,
    min: 1,
    max: 100, // 100 MB max
  },
  smtpHost: {
    pattern: /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    patternMessage: "SMTP Host must be a valid hostname",
  },
  smtpPort: {
    pattern: /^\d{2,5}$/,
    patternMessage: "SMTP Port must be a valid port number (e.g., 587, 465)",
  },
  smtpUser: {
    maxLength: 100,
  },
  emailFromName: {
    maxLength: 50,
  },
  emailFromAddress: {
    email: true,
  },
};

export const rejectionReasonValidation: ValidationSchema<{
  rejectionReason: string;
}> = {
  rejectionReason: {
    required: true,
    minLength: 20,
    maxLength: 500,
  },
};

// Helper hook-like function to manage form errors
export function createFormState<T extends Record<string, unknown>>(
  initialData: T
) {
  return {
    data: { ...initialData },
    errors: {} as Record<keyof T, string>,
    touched: {} as Record<keyof T, boolean>,
  };
}

// Input error styling classes
export const inputErrorClass =
  "border-red-500 focus:ring-red-500 focus:border-red-500";
export const inputSuccessClass =
  "border-green-500 focus:ring-green-500 focus:border-green-500";
