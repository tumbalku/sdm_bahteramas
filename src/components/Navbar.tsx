"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Sun, Moon, Menu, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NavbarProps {
  userName?: string | null;
  userRole?: string | null;
  onMenuClick?: () => void;
}

export function Navbar({ userName, userRole, onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:inline">Selamat Datang,</span>
          <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[120px] sm:max-w-[200px]" title={userName || "Pegawai"}>
            {userName || "Pegawai"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Dropdown Menu */}
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground border border-border bg-background"
                title="Pilih Tema"
                aria-label="Pilih Tema"
              >
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center justify-between cursor-pointer font-medium text-xs py-2"
              >
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Mode Terang</span>
                </div>
                {theme !== "dark" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center justify-between cursor-pointer font-medium text-xs py-2"
              >
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Mode Gelap</span>
                </div>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-muted animate-pulse" />
        )}

        {/* Role Badge (Hidden on small mobile screens, visible on sm and up) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-accent-foreground border border-border">
          <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>{userRole || "EMPLOYEE"}</span>
        </div>

        {/* LogOut Button (Icon only) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-9 w-9"
          title="Keluar"
          aria-label="Keluar"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
