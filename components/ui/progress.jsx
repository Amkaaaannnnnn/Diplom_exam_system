export function Progress({ value = 0, max = 100, className, ...props }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
    return (
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className || ""}`} {...props}>
        <div
          className="bg-blue-500 h-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin="0"
          aria-valuemax={max}
        />
      </div>
    )
  }
  