'use client'

import React from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils/utils'

interface RequiredLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function RequiredLabel({ 
  required = false, 
  children, 
  className,
  ...props 
}: RequiredLabelProps) {
  return (
    <Label 
      className={cn(
        "text-sm font-medium flex items-center gap-2",
        className
      )} 
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive ml-1 text-base leading-none">*</span>
      )}
    </Label>
  )
}

interface FormFieldWrapperProps {
  label: React.ReactNode
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  children,
  className
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <RequiredLabel required={required}>
        {label}
      </RequiredLabel>
      {children}
      {error && (
        <p className="text-sm text-destructive animate-in slide-in-from-left-1 duration-200">
          {error}
        </p>
      )}
    </div>
  )
}