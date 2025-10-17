'use client';

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

const STORAGE_KEY = "mirai-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"theme-light" | "theme-dark">("theme-light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const html = document.documentElement;
    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | "theme-light"
      | "theme-dark"
      | null;
    const current =
      stored ??
      (html.classList.contains("theme-dark") ? "theme-dark" : ("theme-light" as const));
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    const next = theme === "theme-dark" ? "theme-light" : ("theme-dark" as const);
    setTheme(next);
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      html.classList.remove("theme-light", "theme-dark");
      html.classList.add(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={theme === "theme-dark"}
      onClick={toggleTheme}
      className="w-28 justify-between"
    >
      {theme === "theme-dark" ? (
        <>
          <Moon className="h-4 w-4" aria-hidden="true" />
          <span>ダーク</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" aria-hidden="true" />
          <span>ライト</span>
        </>
      )}
    </Button>
  );
}
