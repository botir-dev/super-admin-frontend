"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchApi, restaurantApi } from "@/lib/services";
import type { Branch, Restaurant } from "@/types";
import toast from "react-hot-toast";
import {
  GitBranch,
  Plus,
  Pencil,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Search,
  Phone,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react";
import { useState } from "react";

// ─── Modal ────────────────────────────────────────────────────
function BranchModal({
  branch,
  restaurants,
  onClose,
}: {
  branch?: Branch;
  restaurants: Restaurant[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    restaurant_id: branch?.restaurant_id ?? "",
    name: branch?.name ?? "",
    address: branch?.address ?? "",
    phone: branch?.phone ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      branch
        ? branchApi.update(branch.id, {
            name: form.name,
            address: form.address,
            phone: form.phone,
          })
        : branchApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success(branch ? "Filial yangilandi" : "Filial yaratildi");
      onClose();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Xatolik yuz berdi"),
  });

  const isValid = branch
    ? !!form.name.trim()
    : !!form.restaurant_id && !!form.name.trim();

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {branch ? "Filialni tahrirlash" : "Yangi filial"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {branch
                ? `${branch.restaurant_name ?? ""}`
                : "Restoran tanlang va filial ma'lumotlarini kiriting"}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Restoran tanlash — faqat yangi yaratishda */}
          {!branch && (
            <div>
              <label className="label">Restoran *</label>
              <select
                className="input"
                value={form.restaurant_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, restaurant_id: e.target.value }))
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
          )}
          <div>
            <label className="label">Filial nomi *</label>
            <input
              className="input"
              placeholder="Markaziy filial"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Manzil</label>
            <input
              className="input"
              placeholder="Toshkent, Yunusobod"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
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

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">
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
              {branch ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function BranchesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Branch | null>(null);
  const [search, setSearch] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches", filterRestaurant],
    queryFn: () =>
      branchApi
        .getAll(filterRestaurant || undefined)
        .then((r) => r.data.data),
  });

  const toggleActive = useMutation({
    mutationFn: (b: Branch) =>
      branchApi.update(b.id, { is_active: !b.is_active }),
    onSuccess: (_, b) => {
      qc.invalidateQueries({ queryKey: ["branches"] });
      toast.success(b.is_active ? "Nofaol qilindi" : "Faollashtirildi");
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xato"),
  });

  const filtered =
    branches?.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.address?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search) ||
        b.restaurant_name?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <DashboardLayout>
      <div className="animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Filiallar
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Jami: {branches?.length ?? 0} ta
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Yangi filial
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
              placeholder="Qidirish..."
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

        {/* Grid */}
        {isLoading ? (
          <div
            className="card p-8 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Yuklanmoqda...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <GitBranch
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
              {search || filterRestaurant ? "Topilmadi" : "Hech qanday filial yo'q"}
            </p>
            {!search && !filterRestaurant && (
              <button
                onClick={() => setModal("create")}
                className="btn-primary mt-4 mx-auto"
              >
                <Plus className="w-4 h-4" /> Filial yaratish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: b.is_active
                          ? "var(--green-dim)"
                          : "var(--bg-surface)",
                        border: `1px solid ${b.is_active ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                      }}
                    >
                      <GitBranch
                        className="w-4 h-4"
                        style={{
                          color: b.is_active
                            ? "var(--green)"
                            : "var(--text-muted)",
                        }}
                      />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {b.name}
                      </div>
                      {b.restaurant_name && (
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {b.restaurant_name}
                        </div>
                      )}
                    </div>
                  </div>
                  {b.is_active ? (
                    <div className="badge-active">
                      <CheckCircle className="w-3 h-3" /> Faol
                    </div>
                  ) : (
                    <div className="badge-inactive">
                      <XCircle className="w-3 h-3" /> Nofaol
                    </div>
                  )}
                </div>

                {(b.address || b.phone) && (
                  <div
                    className="space-y-1 mb-3 p-2 rounded-lg"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    {b.address && (
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <MapPin className="w-3 h-3 shrink-0" />
                        {b.address}
                      </div>
                    )}
                    {b.phone && (
                      <div
                        className="flex items-center gap-1.5 text-xs mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        {b.phone}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive.mutate(b)}
                    className="btn-secondary flex-1 justify-center text-xs py-1.5"
                  >
                    {b.is_active ? (
                      <ToggleRight
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--green)" }}
                      />
                    ) : (
                      <ToggleLeft className="w-3.5 h-3.5" />
                    )}
                    {b.is_active ? "Nofaol" : "Faollashtirish"}
                  </button>
                  <button
                    onClick={() => {
                      setSelected(b);
                      setModal("edit");
                    }}
                    className="btn-icon"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === "create" && (
        <BranchModal
          restaurants={restaurants ?? []}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "edit" && selected && (
        <BranchModal
          branch={selected}
          restaurants={restaurants ?? []}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
