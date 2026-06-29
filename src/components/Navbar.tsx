"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavbarProps {
  userName?: string | null;
  userRole?: string | null;
}

export function Navbar({ userName, userRole }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Selamat Datang,</span>
        <span className="text-sm font-bold text-foreground">{userName || "Pegawai"}</span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Switcher Segmented Control */}
        {mounted ? (
          <div className="flex items-center bg-muted/80 p-1 rounded-full border border-border">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "light"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mode Terang (Light)"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "dark"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mode Gelap (Dark)"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-1.5 rounded-full transition-all ${
                theme === "system"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Ikuti Sistem"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-24 h-8 rounded-full bg-muted animate-pulse" />
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-xs font-semibold uppercase tracking-wider text-accent-foreground border border-border">
          <UserIcon className="w-3.5 h-3.5" />
          <span>{userRole || "EMPLOYEE"}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </header>
  );
}
