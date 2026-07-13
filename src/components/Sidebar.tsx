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
  Settings,
  X,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole: Role;
  isOpen?: boolean;
  onClose?: () => void;
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
    title: "Statistik",
    href: "/statistics",
    icon: BarChart3,
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
    title: "Pengaturan Sistem",
    href: "/settings",
    icon: Settings,
    roles: [Role.ADMIN],
  },
  {
    title: "Profil Saya",
    href: "/profile",
    icon: User,
    roles: [Role.ADMIN, Role.STAFF, Role.EMPLOYEE],
  },
];

export function Sidebar({ userRole, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const sidebarContent = (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Brand Logo */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SIMDP Logo" className="w-9 h-9 object-contain shrink-0" />
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight tracking-tight">SIMDP</h1>
            <span className="text-[10px] text-muted-foreground font-medium leading-none">RSUD BAHTERAMAS</span>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onClose && onClose()}
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

  return (
    <>
      {/* Desktop Static Sidebar */}
      <div className="hidden lg:block h-screen shrink-0">{sidebarContent}</div>

      {/* Mobile Overlay Sidebar Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          <div className="relative z-10 h-full animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
