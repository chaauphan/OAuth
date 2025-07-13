"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Debug logging
  React.useEffect(() => {
    if (mounted) {
      console.log('ModeToggle mounted - theme:', theme, 'resolvedTheme:', resolvedTheme)
      console.log('HTML classes:', document.documentElement.className)
    }
  }, [mounted, theme, resolvedTheme])

  const handleClick = () => {
    console.log('Button clicked!')
    console.log('Current theme:', theme)
    console.log('Resolved theme:', resolvedTheme)
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    console.log('Setting theme to:', newTheme)
    setTheme(newTheme)
    
    // Check if the class was actually applied
    setTimeout(() => {
      console.log('After setTheme - HTML classes:', document.documentElement.className)
      console.log('Has dark class:', document.documentElement.classList.contains('dark'))
    }, 100)
  }

  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Sun className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-700"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  )
}