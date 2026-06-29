"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Role } from "@prisma/client";

interface DashboardLayoutClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        userRole={user.role}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          userName={user.name}
          userRole={user.role}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
