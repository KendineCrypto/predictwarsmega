"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/Icons";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true); // pessimistic default (matches server)

  // Sync with localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("pw_theme");
    const dark = stored !== "light"; // default → dark
    setIsDark(dark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("pw_theme", next ? "dark" : "light");
    const root = document.documentElement;
    if (next) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        border border-mega-border
        text-mega-muted hover:text-mega-text hover:border-mega-border
        bg-mega-surface/60 hover:bg-mega-surface
        transition-all duration-200
      "
    >
      {isDark
        ? <SunIcon  className="w-4 h-4" />
        : <MoonIcon className="w-4 h-4" />}
    </button>
  );
}
