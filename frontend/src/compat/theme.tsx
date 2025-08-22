
import React from "react";
type Theme = "light" | "dark" | "system";
const Ctx = React.createContext<{theme: Theme; setTheme: (t:Theme)=>void}>({ theme: "system", setTheme: ()=>{} });
export function useTheme(){ return React.useContext(Ctx); }
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "system");
  React.useEffect(() => {
    const root = document.documentElement;
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && sysDark);
    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}
