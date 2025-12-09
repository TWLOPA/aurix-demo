import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button Component - ElevenLabs UI Standards Compliant
 * 
 * Border Radius: 8px (medium) default, pill for certain variants
 * Typography: 14px (sm), font-medium (500)
 * Spacing: 4px base grid (px-4 = 16px, h-10 = 40px)
 * Animation: ease-in-out transitions
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium",
    "rounded-md", // 8px border radius
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - Azure blue with hover state
        default: [
          "bg-azure text-white",
          "shadow-sm",
          "hover:bg-azure/90 hover:shadow-md",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Destructive - Red
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm",
          "hover:bg-destructive/90",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Outline - Border with transparent bg
        outline: [
          "border border-border bg-transparent",
          "text-foreground",
          "hover:bg-muted hover:border-muted-foreground/20",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Secondary - Mist background
        secondary: [
          "bg-mist text-shadow-blue",
          "hover:bg-mist/80",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Ghost - No background
        ghost: [
          "text-foreground",
          "hover:bg-mist",
          "active:scale-[0.98]",
        ].join(" "),
        
        // Link - Underline style
        link: [
          "text-azure underline-offset-4",
          "hover:underline",
        ].join(" "),
        
        // Premium CTA - Uses orb gradient (only for special CTAs)
        premium: [
          "bg-gradient-to-r from-azure to-electric-cyan text-white",
          "shadow-md",
          "hover:shadow-glow hover:scale-[1.02]",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        // Height follows 4px grid: 32, 40, 48
        sm: "h-8 px-3 text-xs rounded", // 32px, 4px radius
        default: "h-10 px-4", // 40px
        lg: "h-12 px-6 text-base", // 48px
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
