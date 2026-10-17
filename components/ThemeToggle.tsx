"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ThemeToggle({ className, variant = "ghost", size = "icon" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("h-9 w-9 opacity-80", className)}
        aria-label="Toggle theme"
        disabled
      >
        <span className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-9 w-9 cursor-pointer transition-transform active:scale-95", className)}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "ប្ដូរទៅពន្លឺ (Light mode)" : "ប្ដូរទៅងងឹត (Dark mode)"}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

