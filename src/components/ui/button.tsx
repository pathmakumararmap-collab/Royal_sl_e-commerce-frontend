import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-luxury disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-luxury-sm hover:bg-primary-hover hover:shadow-luxury-md hover:-translate-y-px",
        destructive:
          "bg-destructive text-white shadow-luxury-sm hover:bg-destructive/90 hover:shadow-luxury-md hover:-translate-y-px focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background/60 shadow-luxury-sm backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-luxury-md hover:-translate-y-px dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-luxury-sm hover:bg-secondary/80 hover:shadow-luxury-md hover:-translate-y-px",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-luxury-sm hover:bg-success/90 hover:shadow-luxury-md hover:-translate-y-px",
        gradient:
          "bg-gradient-brand text-white shadow-luxury-glow hover:shadow-luxury-lg hover:-translate-y-px",
        gold: "bg-gradient-gold text-accent-foreground shadow-luxury-sm hover:shadow-luxury-md hover:-translate-y-px",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-lg px-7 text-[0.9rem] has-[>svg]:px-5",
        xl: "h-13 rounded-xl px-9 text-base has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-11 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
