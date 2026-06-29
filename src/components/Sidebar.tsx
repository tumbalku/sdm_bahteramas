"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: Role;
}

interface MenuItem {
  title: string;
  href: string;
  icon: any;
  roles: Role[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.STAFF, Role.EMPLOYEE],
  },
  {
    title: "Dokumen Saya",
    href: "/documents",
    icon: FileText,
    roles: [Role.ADMIN, Role.STAFF, Role.EMPLOYEE],
  },
  {
    title: "Verifikasi Berkas",
    href: "/verification",
    icon: CheckSquare,
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: "Master Jenis Dokumen",
    href: "/document-types",
    icon: FileSpreadsheet,
    roles: [Role.ADMIN],
  },
  {
    title: "Manajemen Pegawai",
    href: "/users",
    icon: Users,
    roles: [Role.ADMIN],
  },
  {
    title: "Audit Security Log",
    href: "/security-logs",
    icon: ShieldAlert,
    roles: [Role.ADMIN],
  },
  {
    title: "Profil Saya",
    href: "/profile",
    icon: User,
    roles: [Role.ADMIN, Role.STAFF, Role.EMPLOYEE],
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Brand Logo */}
      <div className="h-16 px-6 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h1 className="font-bold text-lg leading-none tracking-tight">SMDP Portal</h1>

      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
