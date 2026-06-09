"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { managerApi, restaurantApi, branchApi } from "@/lib/services";
import type { Manager, Restaurant, Branch } from "@/types";
import toast from "react-hot-toast";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  Filter,
  Building2,
  GitBranch,
} from "lucide-react";
import { useState } from "react";

// ─── Create/Edit Modal ────────────────────────────────────────
function ManagerModal({
  manager,
  restaurants,
  onClose,
}: {
  manager?: Manager;
  restaurants: Restaurant[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    restaurant_id: manager?.restaurant_id ?? "",
    branch_id: manager?.branch_id ?? "",
    full_name: manager?.full_name ?? "",
    username: manager?.username ?? "",
    phone: manager?.phone ?? "",
    password: "",
    telegram_chat_id: manager?.telegram_chat_id ?? "",
  });
  const [showPass, setShowPass] = useState(false);

  // Branch qilish — tanlangan restorani bo'yicha
  const { data: branches } = useQuery({
    queryKey: ["branches", form.restaurant_id],
    queryFn: () =>
      branchApi.getAll(form.restaurant_id).then((r) => r.data.data),
    enabled: !!form.restaurant_id,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (manager) {
        const data: any = {
          full_name: form.full_name,
          phone: form.phone,
          telegram_chat_id: form.telegram_chat_id || undefined,
        };
        if (form.password) data.password = form.password;
        return managerApi.update(manager.id, data);
      }
      return managerApi.create({
        restaurant_id: form.restaurant_id,
        branch_id: form.branch_id,
        full_name: form.full_name,
        username: form.username,
        phone: form.phone || undefined,
        password: form.password,
        telegram_chat_id: form.telegram_chat_id || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      toast.success(manager ? "Menejer yangilandi" : "Menejer yaratildi");
      onClose();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Xatolik yuz berdi"),
  });

  const isValid = manager
    ? !!form.full_name.trim()
    : !!form.restaurant_id &&
      !!form.branch_id &&
      !!form.full_name.trim() &&
      !!form.username.trim() &&
      form.password.length >= 4;

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {manager ? "Menejer tahrirlash" : "Yangi menejer"}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {manager
                ? `@${manager.username}`
                : "Login ma'lumotlari va filial biriktiring"}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {!manager && (
            <>
              <div>
                <label className="label">Restoran *</label>
                <select
                  className="input"
                  value={form.restaurant_id}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      restaurant_id: e.target.value,
                      branch_id: "",
                    }))
                  }
                >
                  <option value="">— Tanlang —</option>
                  {restaurants
                    .filter((r) => r.is_active)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">Filial *</label>
                <select
                  className="input"
                  value={form.branch_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, branch_id: e.target.value }))
                  }
                  disabled={!form.restaurant_id}
                >
                  <option value="">— Tanlang —</option>
                  {branches
                    ?.filter((b) => b.is_active)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">To'liq ismi *</label>
              <input
                className="input"
                placeholder="Abdullayev Bekzod"
                value={form.full_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, full_name: e.target.value }))
                }
              />
            </div>
            {!manager && (
              <div>
                <label className="label">Username *</label>
                <input
                  className="input mono"
                  placeholder="bekzod_manager"
                  value={form.username}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
            )}
          </div>

          <div>
            <label className="label">Telefon</label>
            <input
              className="input"
              placeholder="+998901234567"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="label">Telegram Chat ID (ixtiyoriy)</label>
            <input
              className="input mono"
              placeholder="Masalan: 123456789"
              value={form.telegram_chat_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, telegram_chat_id: e.target.value }))
              }
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              2FA uchun — menejer Telegram botdan /start bosib ID olishi kerak
            </p>
          </div>

          <div>
            <label className="label">
              {manager ? "Yangi parol (ixtiyoriy)" : "Parol *"}
            </label>
            <div className="relative">
              <input
                className="input mono pr-10"
                type={showPass ? "text" : "password"}
                placeholder={
                  manager ? "O'zgartirilmasa bo'sh qoldiring" : "••••••••"
                }
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="btn-secondary flex-1 justify-center"
            >
              Bekor
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !isValid}
              className="btn-primary flex-1 justify-center"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {manager ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────
function DeleteConfirm({
  manager,
  onClose,
}: {
  manager: Manager;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => managerApi.delete(manager.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      toast.success("Menejer o'chirildi");
      onClose();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Xatolik yuz berdi"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal max-w-sm">
        <div className="flex justify-end mb-2">
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-center pb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{
              background: "var(--red-dim)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <Trash2 className="w-5 h-5" style={{ color: "var(--red)" }} />
          </div>
          <h3
            className="font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Menejerni o'chirish
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {manager.full_name}
            </span>{" "}
            (<span className="mono text-xs">@{manager.username}</span>)
            o'chiriladi.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--red)" }}>
            Bu amalni bekor qilib bo'lmaydi!
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center"
          >
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-danger flex-1 justify-center"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function ManagersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Manager | null>(null);
  const [search, setSearch] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });

  const { data: managers, isLoading } = useQuery({
    queryKey: ["managers", filterRestaurant],
    queryFn: () =>
      managerApi.getAll(filterRestaurant || undefined).then((r) => r.data.data),
  });

  const toggleActive = useMutation({
    mutationFn: (m: Manager) =>
      managerApi.update(m.id, { is_active: !m.is_active }),
    onSuccess: (_, m) => {
      qc.invalidateQueries({ queryKey: ["managers"] });
      toast.success(m.is_active ? "Nofaol qilindi" : "Faollashtirildi");
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xato"),
  });

  const filtered =
    managers?.filter(
      (m) =>
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        m.username.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search) ||
        m.restaurant_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.branch_name?.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const activeCount = managers?.filter((m) => m.is_active).length ?? 0;

  return (
    <DashboardLayout>
      <div className="animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Menejerlar
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Jami: {managers?.length ?? 0} ta · Faol: {activeCount} ta
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Yangi menejer
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="input pl-9"
              placeholder="Ism, username, telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            <select
              className="input pl-9 pr-8 min-w-[180px]"
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
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div
              className="p-8 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Yuklanmoqda...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Users
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {search || filterRestaurant
                  ? "Topilmadi"
                  : "Hech qanday menejer yo'q"}
              </p>
              {!search && !filterRestaurant && (
                <button
                  onClick={() => setModal("create")}
                  className="btn-primary mt-4 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Menejer yaratish
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Menejer</th>
                    <th>Restoran / Filial</th>
                    <th>Telefon</th>
                    <th>Holat</th>
                    <th style={{ textAlign: "right" }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div>
                          <div className="font-medium">{m.full_name}</div>
                          <div
                            className="text-xs mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            @{m.username}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {m.restaurant_name && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <Building2 className="w-3 h-3 shrink-0" />
                              {m.restaurant_name}
                            </div>
                          )}
                          {m.branch_name && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <GitBranch className="w-3 h-3 shrink-0" />
                              {m.branch_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="mono text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {m.phone || "—"}
                      </td>
                      <td>
                        {m.is_active ? (
                          <div className="badge-active">
                            <CheckCircle className="w-3 h-3" /> Faol
                          </div>
                        ) : (
                          <div className="badge-inactive">
                            <XCircle className="w-3 h-3" /> Nofaol
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleActive.mutate(m)}
                            className="btn-icon"
                            title={
                              m.is_active ? "Nofaol qilish" : "Faollashtirish"
                            }
                          >
                            {m.is_active ? (
                              <ToggleRight
                                className="w-4 h-4"
                                style={{ color: "var(--green)" }}
                              />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelected(m);
                              setModal("edit");
                            }}
                            className="btn-icon"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(m);
                              setModal("delete");
                            }}
                            className="btn-icon"
                            title="O'chirish"
                            style={{ color: "var(--red)" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === "create" && (
        <ManagerModal
          restaurants={restaurants ?? []}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "edit" && selected && (
        <ManagerModal
          manager={selected}
          restaurants={restaurants ?? []}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm
          manager={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
