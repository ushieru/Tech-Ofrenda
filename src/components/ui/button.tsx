import { ButtonHTMLAttributes, forwardRef, ReactElement, cloneElement } from "react"
import { cn } from "@/lib/utils/cn"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const buttonClasses = cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
      {
        "bg-blue-600 text-white hover:bg-blue-700": variant === "default",
        "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
        "border border-gray-300 bg-white hover:bg-gray-50": variant === "outline",
        "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
        "hover:bg-gray-100": variant === "ghost",
        "underline-offset-4 hover:underline text-blue-600": variant === "link",
      },
      {
        "h-10 py-2 px-4": size === "default",
        "h-9 px-3 rounded-md": size === "sm",
        "h-11 px-8 rounded-md": size === "lg",
        "h-10 w-10": size === "icon",
      },
      className
    )

    if (asChild && children) {
      const child = children as ReactElement<any>
      return cloneElement(child, {
        className: cn(buttonClasses, child.props?.className),
        ref,
      })
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }