import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-charcoal text-cream",
        gold: "border-transparent bg-gold text-white",
        outline: "border-charcoal text-charcoal",
        muted: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-green-600 text-white",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
