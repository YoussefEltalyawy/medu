"use client"

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Theme can be 'light', 'dark', or 'system'
type ThemeType = "light" | "dark" | "system";

const getInitialTheme = (): ThemeType => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light" || stored === "system") return stored;
    return "system";
  }
  return "system";
};

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export const ModeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeType>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(getInitialTheme());
    setSystemTheme(getSystemTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? "dark" : "light");
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    let appliedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;
    if (appliedTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, systemTheme, mounted]);

  const handleSetTheme = (mode: ThemeType) => {
    setTheme(mode);
    if (mode === "system") {
      setSystemTheme(getSystemTheme());
    }
  };

  // Don't render until mounted on client
  if (!mounted) return null;

  // Determine which icon to show
  let icon = <Sun className="h-[1.2rem] w-[1.2rem]" />;
  if (theme === "dark" || (theme === "system" && systemTheme === "dark")) {
    icon = <Moon className="h-[1.2rem] w-[1.2rem]" />;
  } else if (theme === "system") {
    icon = <Laptop className="h-[1.2rem] w-[1.2rem]" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetTheme("light")}
          className={theme === "light" ? "font-bold" : ""}
        >
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("dark")}
          className={theme === "dark" ? "font-bold" : ""}
        >
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetTheme("system")}
          className={theme === "system" ? "font-bold" : ""}
        >
          <Laptop className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
