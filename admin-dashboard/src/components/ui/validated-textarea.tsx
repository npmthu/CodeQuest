import * as React from "react";
import { cn } from "./utils";
import { AlertCircle, CheckCircle } from "lucide-react";

export interface ValidatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  success?: boolean;
  label?: string;
  helperText?: string;
  showValidation?: boolean;
  showCharCount?: boolean;
}

const ValidatedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ValidatedTextareaProps
>(
  (
    {
      className,
      error,
      success,
      label,
      helperText,
      showValidation = true,
      showCharCount = false,
      maxLength,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);
    const isValid = success && !hasError;
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-gray-700"
            >
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {showCharCount && maxLength && (
              <span
                className={cn(
                  "text-xs",
                  charCount > maxLength ? "text-red-500" : "text-gray-400"
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
              hasError && showValidation
                ? "border-red-500 focus-visible:ring-red-500"
                : isValid && showValidation
                ? "border-green-500 focus-visible:ring-green-500"
                : "border-input focus-visible:ring-ring",
              className
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${textareaId}-error` : undefined}
            {...props}
          />
          {showValidation && (hasError || isValid) && (
            <div className="absolute right-3 top-3">
              {hasError ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>
        {hasError && showValidation && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
        {helperText && !hasError && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
ValidatedTextarea.displayName = "ValidatedTextarea";

export { ValidatedTextarea };
