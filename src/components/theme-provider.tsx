"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string;
  disableTransitionOnChange?: boolean;
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    defaultTheme === "dark" ? "dark" : "light",
  );

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme") as Theme | null;
    const initialTheme = storedTheme ?? defaultTheme;
    setThemeState(initialTheme);

    const nextResolvedTheme =
      initialTheme === "system" && enableSystem
        ? getSystemTheme()
        : initialTheme === "dark"
          ? "dark"
          : "light";
    setResolvedTheme(nextResolvedTheme);
    document.documentElement.classList.toggle(
      "dark",
      nextResolvedTheme === "dark",
    );

    if (enableSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (
          window.localStorage.getItem("theme") === "system" ||
          !window.localStorage.getItem("theme")
        ) {
          const systemTheme = getSystemTheme();
          setResolvedTheme(systemTheme);
          document.documentElement.classList.toggle(
            "dark",
            systemTheme === "dark",
          );
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    return undefined;
  }, [defaultTheme, enableSystem]);

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem("theme", nextTheme);

      const nextResolvedTheme =
        nextTheme === "system" && enableSystem
          ? getSystemTheme()
          : nextTheme === "dark"
            ? "dark"
            : "light";
      setResolvedTheme(nextResolvedTheme);
      document.documentElement.classList.toggle(
        "dark",
        nextResolvedTheme === "dark",
      );
    },
    [enableSystem],
  );

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
