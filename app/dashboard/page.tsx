"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { restaurantApi, branchApi, managerApi } from "@/lib/services";
import {
  Building2,
  GitBranch,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  subtext?: string;
  icon: React.ElementType;
  color: string;
  href: string;
}) {
  return (
    <Link href={href} className="card p-5 block group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <ArrowRight
          className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-all -translate-x-1 group-hover:translate-x-0"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
      <div
        className="text-2xl font-bold mono mb-1"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </div>
      {subtext && (
        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {subtext}
        </div>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchApi.getAll().then((r) => r.data.data),
  });

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: () => managerApi.getAll().then((r) => r.data.data),
  });

  const activeRestaurants = restaurants?.filter((r) => r.is_active).length ?? 0;
  const inactiveRestaurants = (restaurants?.length ?? 0) - activeRestaurants;
  const activeBranches = branches?.filter((b) => b.is_active).length ?? 0;
  const activeManagers = managers?.filter((m) => m.is_active).length ?? 0;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <DashboardLayout>
      <div className="animate-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {greeting}, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Tizim umumiy holati
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Jami restoranlar"
            value={restaurants?.length ?? "—"}
            subtext={`${activeRestaurants} faol, ${inactiveRestaurants} nofaol`}
            icon={Building2}
            color="#6366f1"
            href="/restaurants"
          />
          <StatCard
            label="Jami filiallar"
            value={branches?.length ?? "—"}
            subtext={`${activeBranches} faol filial`}
            icon={GitBranch}
            color="#22c55e"
            href="/branches"
          />
          <StatCard
            label="Menejerlar"
            value={managers?.length ?? "—"}
            subtext={`${activeManagers} faol menejer`}
            icon={Users}
            color="#f59e0b"
            href="/managers"
          />
          <StatCard
            label="Faollik darajasi"
            value={
              restaurants?.length
                ? `${Math.round((activeRestaurants / restaurants.length) * 100)}%`
                : "—"
            }
            subtext="Faol restoranlar ulushi"
            icon={TrendingUp}
            color="#06b6d4"
            href="/restaurants"
          />
        </div>

        {/* Quick overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent restaurants */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Restoranlar holati
              </h2>
              <Link
                href="/restaurants"
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "var(--accent)" }}
              >
                Barchasi <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!restaurants ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg animate-pulse"
                    style={{ background: "var(--bg-surface)" }}
                  />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
                Restoran yo'q
              </p>
            ) : (
              <div className="space-y-2">
                {restaurants.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Building2
                        className="w-4 h-4 shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      />
                      <span className="text-sm font-medium truncate max-w-[180px]">
                        {r.name}
                      </span>
                    </div>
                    {r.is_active ? (
                      <div className="badge-active">
                        <CheckCircle className="w-3 h-3" /> Faol
                      </div>
                    ) : (
                      <div className="badge-inactive">
                        <XCircle className="w-3 h-3" /> Nofaol
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent managers */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Menejerlar
              </h2>
              <Link
                href="/managers"
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "var(--accent)" }}
              >
                Barchasi <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {!managers ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg animate-pulse"
                    style={{ background: "var(--bg-surface)" }}
                  />
                ))}
              </div>
            ) : managers.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
                Menejer yo'q
              </p>
            ) : (
              <div className="space-y-2">
                {managers.slice(0, 5).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    <div>
                      <div className="text-sm font-medium">{m.full_name}</div>
                      <div
                        className="text-xs mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        @{m.username}
                        {m.restaurant_name && ` · ${m.restaurant_name}`}
                      </div>
                    </div>
                    {m.is_active ? (
                      <div className="badge-active">Faol</div>
                    ) : (
                      <div className="badge-inactive">Nofaol</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
