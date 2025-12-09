import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component - ElevenLabs UI Standards Compliant
 * 
 * Border Radius: 4px (small) for badges
 * Typography: 12px (xs), font-medium (500)
 * Spacing: px-2 (8px), py-0.5 (2px)
 */
const badgeVariants = cva(
  [
    "inline-flex items-center",
    "rounded-sm", // 4px border radius
    "border",
    "px-2 py-0.5",
    "text-xs font-medium",
    "transition-colors duration-200 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default - Azure
        default: [
          "border-transparent",
          "bg-azure text-white",
        ].join(" "),
        
        // Secondary - Mist
        secondary: [
          "border-transparent",
          "bg-mist text-shadow-blue",
        ].join(" "),
        
        // Destructive - Red
        destructive: [
          "border-transparent",
          "bg-destructive/10 text-destructive",
          "border-destructive/20",
        ].join(" "),
        
        // Outline - Border only
        outline: [
          "border-border",
          "text-muted-foreground",
          "bg-transparent",
        ].join(" "),
        
        // Success - Green
        success: [
          "border-transparent",
          "bg-success/10 text-success",
          "border-success/20",
        ].join(" "),
        
        // Warning - Amber
        warning: [
          "border-transparent",
          "bg-warning/10 text-warning",
          "border-warning/20",
        ].join(" "),
        
        // Info - Cyan
        info: [
          "border-transparent",
          "bg-electric-cyan/10 text-azure",
          "border-electric-cyan/20",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
