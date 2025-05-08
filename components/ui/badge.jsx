export function Badge({ className, variant, children, ...props }) {
    const variantClasses = {
      default: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-gray-300 text-gray-800",
      success: "bg-green-500 text-white hover:bg-green-600",
    }
  
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
    const classes = `${baseClasses} ${variantClasses[variant || "default"]} ${className || ""}`
  
    return (
      <div className={classes} {...props}>
        {children}
      </div>
    )
  }
  
  export const badgeVariants = (variant) => {
    return `badge-${variant}`
  }
  