"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/ui/common/input";
import { Textarea } from "@/ui/common/textarea";
import type { FormInputs } from "@/lib/types";

interface FormFieldProps {
  label: string;
  name: keyof FormInputs;
  form: UseFormReturn<FormInputs>;
  placeholder?: string;
  textarea?: boolean;
}

// Atlassian Form Field Component
export function FormField({
  label,
  name,
  form,
  placeholder,
  textarea,
}: FormFieldProps) {
  const Component = textarea ? Textarea : Input;
  const hasError = !!form.formState.errors[name];

  return (
    <div className="space-y-2">
      <label className="block text-body-small font-medium text-foreground">
        {label}
      </label>
      <Component
        {...form.register(name)}
        placeholder={placeholder}
        className={`w-full transition-all duration-200 ${
          hasError 
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" 
            : ""
        } ${
          textarea ? "min-h-[100px] resize-y" : ""
        }`}
      />
      {hasError && (
        <p className="text-body-small text-destructive">
          {form.formState.errors[name]?.message}
        </p>
      )}
    </div>
  );
}
