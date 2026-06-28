"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

interface NavbarProps {
  userName?: string | null;
  userRole?: string | null;
}

export function Navbar({ userName, userRole }: NavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Selamat Datang,</span>
        <span className="text-sm font-bold text-foreground">{userName || "Pegawai"}</span>
      </div>

      <div className="flex items-center gap-4">
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
