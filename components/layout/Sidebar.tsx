"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Users,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Crown,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/restaurants", label: "Restoranlar", icon: Building2 },
  { href: "/branches", label: "Filiallar", icon: GitBranch },
  { href: "/managers", label: "Menejerlar", icon: Users },
  { href: "/owners", label: "Ownerlar", icon: Crown },
  { href: "/tariffs", label: "Tarif Boshqaruvi", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success("Chiqildi");
      router.replace("/login");
    } catch {
      toast.error("Xatolik");
    } finally {
      setLoggingOut(false);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              Super Admin
            </div>
            <div
              className="text-xs mono"
              style={{ color: "var(--text-muted)" }}
            >
              v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
              style={
                active
                  ? {
                      background: "var(--accent-glow)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      color: "var(--accent)",
                    }
                  : { border: "1px solid transparent" }
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div
          className="p-3 rounded-xl mb-2"
          style={{ background: "var(--bg-surface)" }}
        >
          <div
            className="text-xs font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {user?.full_name}
          </div>
          <div
            className="text-xs mono mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            super_admin
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
          style={{ color: "var(--red)", border: "1px solid transparent" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--red-dim)";
            (e.currentTarget as HTMLElement).style.borderColor =
              "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          }}
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Chiqilmoqda..." : "Chiqish"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-r"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">Super Admin</span>
        </div>
        <button className="btn-icon" onClick={() => setOpen(true)}>
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-64 animate-slide"
            style={{
              background: "var(--bg-surface)",
              borderRight: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-end p-3 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <button className="btn-icon" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
