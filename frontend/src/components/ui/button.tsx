import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-wide transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Asosiy — rejimga moslashadi (yorug': to'q, dark: oq)
        default:
          "bg-[rgb(var(--btn-bg))] text-[rgb(var(--btn-fg))] shadow-glass-sm hover:bg-[rgb(var(--btn-bg-h))]",
        // Oltin urg'u
        gold:
          "bg-gold text-white shadow-glass-sm hover:bg-gold-600",
        // Outline (iOS — shisha)
        outline:
          "glass text-charcoal hover:bg-white/70",
        // Ghost
        ghost:
          "text-charcoal hover:bg-foreground/10",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground shadow-glass-sm hover:bg-destructive/90",
        // Link
        link:
          "rounded-none text-charcoal underline-offset-4 hover:underline hover:text-gold active:scale-100",
        // Secondary (shisha)
        secondary:
          "glass text-charcoal hover:bg-white/10",
      },
      size: {
        default: "h-10 px-5 py-2 sm:h-11 sm:px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-sm sm:h-14 sm:px-8 sm:text-base",
        icon: "h-9 w-9 sm:h-10 sm:w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
