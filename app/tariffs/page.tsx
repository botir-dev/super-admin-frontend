"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tariffApi, restaurantApi, branchApi } from "@/lib/services";
import type {
  BranchTariff,
  RestaurantTariff,
  TariffLog,
  Restaurant,
  Branch,
} from "@/types";
import toast from "react-hot-toast";
import {
  CreditCard,
  Plus,
  RefreshCw,
  Trash2,
  Loader2,
  X,
  Search,
  ChevronDown,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Key,
  History,
  Building2,
  GitBranch,
  Crown,
  Calendar,
  FileText,
  Eye,
  Shield,
} from "lucide-react";
import { useState, useMemo } from "react";
import clsx from "clsx";

// ─── HELPERS ─────────────────────────────────────────────────
const TARIFF_LABELS: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  light: {
    label: "Light",
    color: "var(--text-secondary)",
    bg: "rgba(100,100,140,0.15)",
  },
  standard: {
    label: "Standard",
    color: "var(--accent)",
    bg: "var(--accent-glow)",
  },
  premium: {
    label: "Premium",
    color: "var(--yellow)",
    bg: "var(--yellow-dim)",
  },
};

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.FC<any> }
> = {
  active: {
    label: "Faol",
    color: "var(--green)",
    bg: "var(--green-dim)",
    icon: CheckCircle,
  },
  grace_period: {
    label: "Grace",
    color: "var(--yellow)",
    bg: "var(--yellow-dim)",
    icon: Clock,
  },
  expired: {
    label: "Muddati tugagan",
    color: "var(--red)",
    bg: "var(--red-dim)",
    icon: AlertTriangle,
  },
  not_available: {
    label: "Bloklangan",
    color: "var(--red)",
    bg: "var(--red-dim)",
    icon: XCircle,
  },
  pending: {
    label: "Kutilmoqda",
    color: "var(--text-muted)",
    bg: "rgba(100,100,140,0.1)",
    icon: Clock,
  },
};

const ACTION_LABELS: Record<string, string> = {
  assign: "Belgilandi",
  extend: "Uzaytirildi",
  revoke: "Bekor qilindi",
  expire: "Muddati tugadi",
  grace_start: "Grace boshlandi",
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="badge-inactive">Yo'q</span>;
  const m = STATUS_META[status];
  if (!m) return <span className="badge-inactive">{status}</span>;
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}33` }}
    >
      <Icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

function TariffBadge({ type }: { type: string | null }) {
  if (!type) return <span className="badge-inactive">Yo'q</span>;
  const m = TARIFF_LABELS[type];
  if (!m) return <span className="badge-inactive">{type}</span>;
  return (
    <span
      className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border mono"
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}40` }}
    >
      {m.label}
    </span>
  );
}

// ─── SECRET KEY MODAL ─────────────────────────────────────────
function SecretKeyModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { data: config } = useQuery({
    queryKey: ["tariff-config"],
    queryFn: () => tariffApi.getConfig().then((r) => r.data.data),
  });

  const [form, setForm] = useState({
    new_secret_key: "",
    current_secret_key: "",
  });

  const mutation = useMutation({
    mutationFn: () => tariffApi.setConfig(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tariff-config"] });
      toast.success("Kalit yangilandi");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--accent-glow)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Key className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3
                className="font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Maxsus kalit
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {config?.configured
                  ? `Oxirgi yangilanish: ${fmtDateTime(config.updated_at)}`
                  : "Kalit hali o'rnatilmagan"}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {config?.configured && (
            <div>
              <label className="label">Joriy kalit</label>
              <input
                type="password"
                className="input"
                placeholder="Eski maxsus kalit"
                value={form.current_secret_key}
                onChange={(e) =>
                  setForm((p) => ({ ...p, current_secret_key: e.target.value }))
                }
              />
            </div>
          )}
          <div>
            <label className="label">Yangi kalit</label>
            <input
              type="password"
              className="input"
              placeholder="Kamida 8 belgi"
              value={form.new_secret_key}
              onChange={(e) =>
                setForm((p) => ({ ...p, new_secret_key: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Bekor
          </button>
          <button
            className="btn-primary flex-1"
            disabled={mutation.isPending || form.new_secret_key.length < 8}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Key className="w-4 h-4" />
            )}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ASSIGN BRANCH TARIFF MODAL ───────────────────────────────
function AssignBranchModal({
  branch,
  existing,
  onClose,
}: {
  branch: Branch & { restaurant_name?: string };
  existing: BranchTariff | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    tariff_type:
      (existing?.tariff_type === "premium"
        ? "standard"
        : existing?.tariff_type) ?? ("light" as "light" | "standard"),
    expires_at: existing?.expires_at ? existing.expires_at.split("T")[0] : "",
    secret_key: "",
    note: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      tariffApi.assignBranch(branch.id, {
        tariff_type: form.tariff_type,
        expires_at: form.expires_at || null,
        secret_key: form.secret_key,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-tariffs"] });
      toast.success("Tarif muvaffaqiyatli belgilandi");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {existing ? "Tarifni o'zgartirish" : "Tarif belgilash"}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {branch.name} · {branch.restaurant_name}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Tarif turi</label>
            <div className="grid grid-cols-2 gap-2">
              {(["light", "standard"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((p) => ({ ...p, tariff_type: t }))}
                  className={clsx(
                    "p-3 rounded-xl border text-sm font-semibold transition-all",
                    form.tariff_type === t
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)]",
                  )}
                  style={
                    form.tariff_type === t
                      ? { background: "var(--accent-glow)" }
                      : { background: "var(--bg-surface)" }
                  }
                >
                  <div>{t === "light" ? "🌟 Light" : "⚡ Standard"}</div>
                  <div className="text-xs font-normal mt-0.5 opacity-70">
                    {t === "light" ? "$33/oy" : "$65/oy"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Muddat tugash sanasi</label>
            <input
              type="date"
              className="input"
              value={form.expires_at}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((p) => ({ ...p, expires_at: e.target.value }))
              }
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Bo'sh qoldirilsa — muddatsiz
            </p>
          </div>

          <div>
            <label className="label">Maxsus kalit *</label>
            <input
              type="password"
              className="input"
              placeholder="Tarif kalitini kiriting"
              value={form.secret_key}
              onChange={(e) =>
                setForm((p) => ({ ...p, secret_key: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="label">Izoh (ixtiyoriy)</label>
            <input
              className="input"
              placeholder="Masalan: 1 oylik sinov uchun"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Bekor
          </button>
          <button
            className="btn-primary flex-1"
            disabled={mutation.isPending || !form.secret_key}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Belgilash
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EXTEND TARIFF MODAL ──────────────────────────────────────
function ExtendModal({
  branchId,
  branchName,
  onClose,
}: {
  branchId: string;
  branchName: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    new_expires_at: "",
    secret_key: "",
    note: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      tariffApi.extendBranch(branchId, {
        new_expires_at: form.new_expires_at,
        secret_key: form.secret_key,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-tariffs"] });
      toast.success("Tarif muddati yangilandi");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              Muddatni uzaytirish
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {branchName}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Yangi tugash sanasi *</label>
            <input
              type="date"
              className="input"
              value={form.new_expires_at}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((p) => ({ ...p, new_expires_at: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Maxsus kalit *</label>
            <input
              type="password"
              className="input"
              placeholder="Tarif kalitini kiriting"
              value={form.secret_key}
              onChange={(e) =>
                setForm((p) => ({ ...p, secret_key: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Izoh (ixtiyoriy)</label>
            <input
              className="input"
              placeholder="Uzaytirish sababi"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Bekor
          </button>
          <button
            className="btn-primary flex-1"
            disabled={
              mutation.isPending || !form.new_expires_at || !form.secret_key
            }
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Uzaytirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── REVOKE MODAL ─────────────────────────────────────────────
function RevokeModal({
  branchId,
  branchName,
  onClose,
}: {
  branchId: string;
  branchName: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ secret_key: "", note: "" });

  const mutation = useMutation({
    mutationFn: () =>
      tariffApi.revokeBranch(branchId, {
        secret_key: form.secret_key,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-tariffs"] });
      toast.success("Tarif bekor qilindi");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--red)" }}>
              Tarifni bekor qilish
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {branchName}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="rounded-xl p-3 mb-4 flex items-start gap-2"
          style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <AlertTriangle
            className="w-4 h-4 mt-0.5 shrink-0"
            style={{ color: "var(--red)" }}
          />
          <p className="text-xs" style={{ color: "var(--red)" }}>
            Bu filialning tarifi to'xtatiladi va tizimdan foydalanish
            bloklanadi.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Maxsus kalit *</label>
            <input
              type="password"
              className="input"
              placeholder="Tasdiqlash uchun kalit kiriting"
              value={form.secret_key}
              onChange={(e) =>
                setForm((p) => ({ ...p, secret_key: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Sabab (ixtiyoriy)</label>
            <input
              className="input"
              placeholder="Bekor qilish sababi"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Bekor
          </button>
          <button
            className="btn-danger flex-1"
            disabled={mutation.isPending || !form.secret_key}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PREMIUM RESTAURANT MODAL ─────────────────────────────────
function PremiumRestaurantModal({
  restaurant,
  existing,
  onClose,
}: {
  restaurant: Restaurant;
  existing: RestaurantTariff | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    expires_at: existing?.expires_at ? existing.expires_at.split("T")[0] : "",
    secret_key: "",
    note: "",
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      tariffApi.assignRestaurantPremium(restaurant.id, {
        expires_at: form.expires_at || null,
        secret_key: form.secret_key,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-tariffs"] });
      toast.success(`Premium tarif belgilandi. Barcha filiallar yangilandi.`);
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  const extendMutation = useMutation({
    mutationFn: () =>
      tariffApi.extendRestaurant(restaurant.id, {
        new_expires_at: form.expires_at,
        secret_key: form.secret_key,
        note: form.note || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branch-tariffs"] });
      toast.success("Premium tarif uzaytirildi");
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xatolik"),
  });

  const isExtend =
    existing &&
    existing.status !== "not_available" &&
    existing.status !== "expired";
  const isPending = assignMutation.isPending || extendMutation.isPending;

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--yellow-dim)",
                border: "1px solid rgba(234,179,8,0.3)",
              }}
            >
              <Crown className="w-4 h-4" style={{ color: "var(--yellow)" }} />
            </div>
            <div>
              <h3
                className="font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {isExtend ? "Premium uzaytirish" : "Premium berish"}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {restaurant.name} · Barcha filiallar yangilanadi
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="rounded-xl p-3 mb-4 flex items-start gap-2"
          style={{
            background: "var(--yellow-dim)",
            border: "1px solid rgba(234,179,8,0.2)",
          }}
        >
          <Crown
            className="w-4 h-4 mt-0.5 shrink-0"
            style={{ color: "var(--yellow)" }}
          />
          <p className="text-xs" style={{ color: "var(--yellow)" }}>
            Premium tarif restoranning barcha faol filiallariga avtomatik
            beriladi. Ko'p filial imkoniyati ochiladi.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">
              {isExtend ? "Yangi tugash sanasi *" : "Muddat tugash sanasi"}
            </label>
            <input
              type="date"
              className="input"
              value={form.expires_at}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((p) => ({ ...p, expires_at: e.target.value }))
              }
            />
            {!isExtend && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                Bo'sh qoldirilsa — muddatsiz
              </p>
            )}
          </div>
          <div>
            <label className="label">Maxsus kalit *</label>
            <input
              type="password"
              className="input"
              placeholder="Tarif kalitini kiriting"
              value={form.secret_key}
              onChange={(e) =>
                setForm((p) => ({ ...p, secret_key: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Izoh (ixtiyoriy)</label>
            <input
              className="input"
              placeholder="Shartnoma raqami yoki sabab"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Bekor
          </button>
          <button
            className="btn-primary flex-1"
            disabled={
              isPending ||
              !form.secret_key ||
              (isExtend ? !form.expires_at : false)
            }
            onClick={() =>
              isExtend ? extendMutation.mutate() : assignMutation.mutate()
            }
            style={{ background: "var(--yellow)", color: "#000" }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            {isExtend ? "Uzaytirish" : "Premium berish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOGS MODAL ───────────────────────────────────────────────
function LogsModal({
  targetId,
  targetName,
  targetType,
  onClose,
}: {
  targetId: string;
  targetName: string;
  targetType: "branch" | "restaurant";
  onClose: () => void;
}) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["tariff-logs", targetId],
    queryFn: () =>
      tariffApi
        .getLogs({ target_id: targetId, target_type: targetType, limit: 30 })
        .then((r) => r.data.data),
  });

  return (
    <div className="modal-backdrop">
      <div
        className="animate-modal"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "600px",
          padding: "1.5rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              Tarif tarixi
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {targetName}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "var(--accent)" }}
            />
          </div>
        ) : !logs?.length ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Hali log yozuvlari yo'q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl p-3"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{
                        background:
                          log.action === "revoke" || log.action === "expire"
                            ? "var(--red-dim)"
                            : log.action === "assign"
                              ? "var(--green-dim)"
                              : "var(--accent-glow)",
                        color:
                          log.action === "revoke" || log.action === "expire"
                            ? "var(--red)"
                            : log.action === "assign"
                              ? "var(--green)"
                              : "var(--accent)",
                      }}
                    >
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                    {log.new_tariff && <TariffBadge type={log.new_tariff} />}
                    {log.new_status && <StatusBadge status={log.new_status} />}
                  </div>
                  <span
                    className="text-xs mono shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {fmtDateTime(log.created_at)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                  {log.new_expires_at && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Muddat:{" "}
                      <span className="font-medium">
                        {fmtDate(log.new_expires_at)}
                      </span>
                    </span>
                  )}
                  {log.performed_by_name && (
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Kim:{" "}
                      <span className="font-medium">
                        {log.performed_by_name}
                      </span>
                    </span>
                  )}
                  {log.note && (
                    <span
                      className="text-xs italic"
                      style={{ color: "var(--text-muted)" }}
                    >
                      "{log.note}"
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
type TabType = "branches" | "restaurants";
type ModalType =
  | { kind: "secret_key" }
  | {
      kind: "assign";
      branch: Branch & { restaurant_name?: string };
      existing: BranchTariff | null;
    }
  | { kind: "extend"; branchId: string; branchName: string }
  | { kind: "revoke"; branchId: string; branchName: string }
  | {
      kind: "premium";
      restaurant: Restaurant;
      existing: RestaurantTariff | null;
    }
  | {
      kind: "logs";
      targetId: string;
      targetName: string;
      targetType: "branch" | "restaurant";
    }
  | null;

export default function TariffsPage() {
  const [tab, setTab] = useState<TabType>("branches");
  const [search, setSearch] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState<ModalType>(null);

  // Data
  const {
    data: branchTariffs,
    isLoading: btLoading,
    refetch: refetchBT,
  } = useQuery({
    queryKey: ["branch-tariffs", filterRestaurant],
    queryFn: () =>
      tariffApi
        .getBranchTariffs(filterRestaurant || undefined)
        .then((r) => r.data.data),
  });

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchApi.getAll().then((r) => r.data.data),
  });

  // Restaurant tariff — query per restaurant
  const restaurantTariffMap = useMemo(
    () => new Map<string, BranchTariff[]>(),
    [],
  );

  // Filtered branch tariffs
  const filteredBT = useMemo(() => {
    if (!branchTariffs) return [];
    return branchTariffs.filter((bt) => {
      const matchSearch =
        !search ||
        bt.branch_name?.toLowerCase().includes(search.toLowerCase()) ||
        bt.restaurant_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || bt.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [branchTariffs, search, filterStatus]);

  // Build branches that have no tariff yet (from branches list)
  const branchesWithoutTariff = useMemo(() => {
    if (!branches || !branchTariffs) return [];
    const withTariffIds = new Set(branchTariffs.map((bt) => bt.branch_id));
    return branches.filter((b) => !withTariffIds.has(b.id));
  }, [branches, branchTariffs]);

  // Stats
  const stats = useMemo(() => {
    if (!branchTariffs) return { active: 0, grace: 0, expired: 0, noTariff: 0 };
    return {
      active: branchTariffs.filter((bt) => bt.status === "active").length,
      grace: branchTariffs.filter((bt) => bt.status === "grace_period").length,
      expired: branchTariffs.filter(
        (bt) => bt.status === "expired" || bt.status === "not_available",
      ).length,
      noTariff: branchesWithoutTariff.length,
    };
  }, [branchTariffs, branchesWithoutTariff]);

  const getBranchObj = (bt: BranchTariff) => {
    const b = branches?.find((b) => b.id === bt.branch_id);
    return {
      ...(b ?? {
        id: bt.branch_id,
        name: bt.branch_name ?? "Noma'lum",
        restaurant_id: "",
        address: "",
        phone: "",
        is_active: true,
        created_at: "",
        updated_at: "",
      }),
      restaurant_name: bt.restaurant_name,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Tarif Boshqaruvi
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Filiallar va restoranlarga tarif belgilash, uzaytirish va
              boshqarish
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => setModal({ kind: "secret_key" })}
          >
            <Key className="w-4 h-4" />
            Kalit
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Faol",
              value: stats.active,
              color: "var(--green)",
              bg: "var(--green-dim)",
            },
            {
              label: "Grace",
              value: stats.grace,
              color: "var(--yellow)",
              bg: "var(--yellow-dim)",
            },
            {
              label: "Bloklangan",
              value: stats.expired,
              color: "var(--red)",
              bg: "var(--red-dim)",
            },
            {
              label: "Tarifisiz",
              value: stats.noTariff,
              color: "var(--text-muted)",
              bg: "rgba(100,100,140,0.1)",
            },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mono"
                style={{ background: s.bg, color: s.color }}
              >
                {s.value}
              </div>
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl w-fit"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          {(
            [
              { key: "branches", label: "Filiallar", icon: GitBranch },
              {
                key: "restaurants",
                label: "Restoranlar (Premium)",
                icon: Crown,
              },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                tab === t.key
                  ? {
                      background: "var(--accent-glow)",
                      color: "var(--accent)",
                      border: "1px solid rgba(99,102,241,0.25)",
                    }
                  : {
                      color: "var(--text-secondary)",
                      border: "1px solid transparent",
                    }
              }
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── BRANCH TARIFFS TAB ── */}
        {tab === "branches" && (
          <div className="space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  className="input pl-9"
                  placeholder="Filial yoki restoran..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="input w-auto"
                value={filterRestaurant}
                onChange={(e) => setFilterRestaurant(e.target.value)}
              >
                <option value="">Barcha restoranlar</option>
                {restaurants?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <select
                className="input w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Barcha statuslar</option>
                <option value="active">Faol</option>
                <option value="grace_period">Grace</option>
                <option value="expired">Muddati tugagan</option>
                <option value="not_available">Bloklangan</option>
              </select>
              <button className="btn-secondary" onClick={() => refetchBT()}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Branches without tariff banner */}
            {branchesWithoutTariff.length > 0 && (
              <div
                className="rounded-xl p-3 flex items-center justify-between gap-3"
                style={{
                  background: "var(--red-dim)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--red)" }}
                  />
                  <span className="text-sm" style={{ color: "var(--red)" }}>
                    <strong>{branchesWithoutTariff.length} ta filial</strong>{" "}
                    tarifga biriktirilmagan — ular tizimga kira olmaydi
                  </span>
                </div>
              </div>
            )}

            {btLoading ? (
              <div className="flex justify-center py-12">
                <Loader2
                  className="w-7 h-7 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
              </div>
            ) : (
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Filial</th>
                      <th>Restoran</th>
                      <th>Tarif</th>
                      <th>Status</th>
                      <th>Tugash sanasi</th>
                      <th>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Rows with tariff */}
                    {filteredBT.map((bt) => (
                      <tr key={bt.id}>
                        <td>
                          <div className="font-medium text-sm">
                            {bt.branch_name}
                          </div>
                          <div className="text-xs mono opacity-50">
                            {bt.branch_id.slice(0, 8)}…
                          </div>
                        </td>
                        <td>
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {bt.restaurant_name}
                          </span>
                        </td>
                        <td>
                          <TariffBadge type={bt.tariff_type} />
                        </td>
                        <td>
                          <StatusBadge status={bt.status} />
                        </td>
                        <td>
                          <span
                            className="text-sm mono"
                            style={{
                              color: bt.expires_at
                                ? "var(--text-primary)"
                                : "var(--text-muted)",
                            }}
                          >
                            {fmtDate(bt.expires_at)}
                          </span>
                          {bt.grace_ends_at && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--yellow)" }}
                            >
                              Grace: {fmtDate(bt.grace_ends_at)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button
                              className="btn-icon"
                              title="Tahrirlash / Qayta belgilash"
                              onClick={() =>
                                setModal({
                                  kind: "assign",
                                  branch: getBranchObj(bt) as any,
                                  existing: bt,
                                })
                              }
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="btn-icon"
                              title="Muddatni uzaytirish"
                              onClick={() =>
                                setModal({
                                  kind: "extend",
                                  branchId: bt.branch_id,
                                  branchName: bt.branch_name ?? "Filial",
                                })
                              }
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="btn-icon"
                              title="Tarix"
                              onClick={() =>
                                setModal({
                                  kind: "logs",
                                  targetId: bt.branch_id,
                                  targetName: bt.branch_name ?? "Filial",
                                  targetType: "branch",
                                })
                              }
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="btn-icon"
                              title="Bekor qilish"
                              style={{
                                color: "var(--red)",
                                borderColor: "rgba(239,68,68,0.2)",
                              }}
                              onClick={() =>
                                setModal({
                                  kind: "revoke",
                                  branchId: bt.branch_id,
                                  branchName: bt.branch_name ?? "Filial",
                                })
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Branches without tariff */}
                    {!filterStatus &&
                      !search &&
                      branchesWithoutTariff.map((b) => {
                        const rest = restaurants?.find(
                          (r) => r.id === b.restaurant_id,
                        );
                        return (
                          <tr
                            key={`no-tariff-${b.id}`}
                            style={{ opacity: 0.65 }}
                          >
                            <td>
                              <div className="font-medium text-sm">
                                {b.name}
                              </div>
                              <div className="text-xs mono opacity-50">
                                {b.id.slice(0, 8)}…
                              </div>
                            </td>
                            <td>
                              <span
                                className="text-sm"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {rest?.name ?? "—"}
                              </span>
                            </td>
                            <td>
                              <span className="badge-inactive">Yo'q</span>
                            </td>
                            <td>
                              <span
                                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  color: "var(--red)",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                }}
                              >
                                <Lock className="w-3 h-3" />
                                Tarifisiz
                              </span>
                            </td>
                            <td>
                              <span
                                className="text-sm mono"
                                style={{ color: "var(--text-muted)" }}
                              >
                                —
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-primary text-xs px-3 py-1.5"
                                onClick={() =>
                                  setModal({
                                    kind: "assign",
                                    branch: {
                                      ...b,
                                      restaurant_name: rest?.name,
                                    },
                                    existing: null,
                                  })
                                }
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Belgilash
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                    {filteredBT.length === 0 &&
                      branchesWithoutTariff.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10">
                            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p
                              className="text-sm"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Ma'lumot topilmadi
                            </p>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── RESTAURANTS PREMIUM TAB ── */}
        {tab === "restaurants" && (
          <div className="space-y-3">
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background: "var(--yellow-dim)",
                border: "1px solid rgba(234,179,8,0.2)",
              }}
            >
              <Crown
                className="w-5 h-5 mt-0.5 shrink-0"
                style={{ color: "var(--yellow)" }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--yellow)" }}
                >
                  Premium tarif haqida
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Premium tarif restoranga berilganda barcha faol filiallariga
                  avtomatik Premium biriktiriladi va ko'p filial imkoniyati
                  ochiladi. Narx: <strong>$90/oy</strong> yoki{" "}
                  <strong>$1000/yillik</strong>.
                </p>
              </div>
            </div>

            {!restaurants?.length ? (
              <div className="card flex justify-center py-12">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: "var(--accent)" }}
                />
              </div>
            ) : (
              <div className="grid gap-3">
                {restaurants.map((r) => (
                  <RestaurantTariffCard
                    key={r.id}
                    restaurant={r}
                    branches={
                      branches?.filter((b) => b.restaurant_id === r.id) ?? []
                    }
                    branchTariffs={
                      branchTariffs?.filter(
                        (bt) => bt.restaurant_id === r.id,
                      ) ?? []
                    }
                    onPremium={(existing) =>
                      setModal({ kind: "premium", restaurant: r, existing })
                    }
                    onLogs={() =>
                      setModal({
                        kind: "logs",
                        targetId: r.id,
                        targetName: r.name,
                        targetType: "restaurant",
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.kind === "secret_key" && (
        <SecretKeyModal onClose={() => setModal(null)} />
      )}
      {modal?.kind === "assign" && (
        <AssignBranchModal
          branch={modal.branch}
          existing={modal.existing}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "extend" && (
        <ExtendModal
          branchId={modal.branchId}
          branchName={modal.branchName}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "revoke" && (
        <RevokeModal
          branchId={modal.branchId}
          branchName={modal.branchName}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "premium" && (
        <PremiumRestaurantModal
          restaurant={modal.restaurant}
          existing={modal.existing}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "logs" && (
        <LogsModal
          targetId={modal.targetId}
          targetName={modal.targetName}
          targetType={modal.targetType}
          onClose={() => setModal(null)}
        />
      )}
    </DashboardLayout>
  );
}

// ─── RESTAURANT TARIFF CARD ───────────────────────────────────
function RestaurantTariffCard({
  restaurant,
  branches,
  branchTariffs,
  onPremium,
  onLogs,
}: {
  restaurant: Restaurant;
  branches: Branch[];
  branchTariffs: BranchTariff[];
  onPremium: (existing: RestaurantTariff | null) => void;
  onLogs: () => void;
}) {
  const { data: restTariff } = useQuery({
    queryKey: ["restaurant-tariff", restaurant.id],
    queryFn: () =>
      tariffApi
        .getRestaurantTariff(restaurant.id)
        .then((r) => r.data.data as RestaurantTariff | null),
  });

  const premiumBranches = branchTariffs.filter(
    (bt) => bt.tariff_type === "premium" && bt.status === "active",
  );
  const totalBranches = branches.length;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <Building2
              className="w-5 h-5"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {restaurant.name}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {totalBranches} ta filial
              {restaurant.address && ` · ${restaurant.address}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {restTariff ? (
            <>
              <StatusBadge status={restTariff.status} />
              {restTariff.expires_at && (
                <span
                  className="text-xs mono"
                  style={{ color: "var(--text-muted)" }}
                >
                  {fmtDate(restTariff.expires_at)}
                </span>
              )}
            </>
          ) : (
            <span className="badge-inactive">Premium yo'q</span>
          )}
        </div>
      </div>

      {totalBranches > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {branches.slice(0, 5).map((b) => {
            const bt = branchTariffs.find((t) => t.branch_id === b.id);
            return (
              <span
                key={b.id}
                className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{
                  background:
                    bt?.tariff_type === "premium" && bt.status === "active"
                      ? "var(--yellow-dim)"
                      : bt?.status === "active"
                        ? "var(--green-dim)"
                        : "rgba(100,100,140,0.1)",
                  color:
                    bt?.tariff_type === "premium" && bt.status === "active"
                      ? "var(--yellow)"
                      : bt?.status === "active"
                        ? "var(--green)"
                        : "var(--text-muted)",
                  border: "1px solid transparent",
                }}
              >
                {b.name}
              </span>
            );
          })}
          {branches.length > 5 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              +{branches.length - 5} ta
            </span>
          )}
        </div>
      )}

      <div
        className="flex gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          className="btn-primary text-sm flex-1"
          onClick={() => onPremium(restTariff ?? null)}
          style={{ background: "var(--yellow)", color: "#000" }}
        >
          <Crown className="w-4 h-4" />
          {restTariff && restTariff.status === "active"
            ? "Uzaytirish"
            : "Premium berish"}
        </button>
        <button className="btn-secondary" onClick={onLogs}>
          <History className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
