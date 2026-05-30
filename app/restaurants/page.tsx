"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantApi } from "@/lib/services";
import type { Restaurant } from "@/types";
import toast from "react-hot-toast";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// ─── Modal ────────────────────────────────────────────────────
function RestaurantModal({
  restaurant,
  onClose,
}: {
  restaurant?: Restaurant;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: restaurant?.name ?? "",
    address: restaurant?.address ?? "",
    logo_url: restaurant?.logo_url ?? "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      restaurant
        ? restaurantApi.update(restaurant.id, form)
        : restaurantApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success(restaurant ? "Restoran yangilandi" : "Restoran yaratildi");
      onClose();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Xatolik yuz berdi"),
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box animate-modal">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
              {restaurant ? "Restoranni tahrirlash" : "Yangi restoran"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {restaurant ? `ID: ${restaurant.id.slice(0, 8)}...` : "Yangi restoran yaratish"}
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Nomi *</label>
            <input
              className="input"
              placeholder="Oqtepa Lavash"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Manzil</label>
            <input
              className="input"
              placeholder="Toshkent, Chilonzor"
              value={form.address}
              onChange={(e) =>
                setForm((p) => ({ ...p, address: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Logo URL</label>
            <input
              className="input"
              placeholder="https://example.com/logo.png"
              value={form.logo_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, logo_url: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center">
              Bekor
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !form.name.trim()}
              className="btn-primary flex-1 justify-center"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {restaurant ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────
function DeleteConfirm({
  restaurant,
  onClose,
}: {
  restaurant: Restaurant;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => restaurantApi.delete(restaurant.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restoran o'chirildi");
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
            style={{ background: "var(--red-dim)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <Trash2 className="w-5 h-5" style={{ color: "var(--red)" }} />
          </div>
          <h3 className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            O'chirishni tasdiqlang
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              "{restaurant.name}"
            </span>{" "}
            restoroni va uning barcha ma'lumotlari o'chiriladi.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--red)" }}>
            Bu amalni bekor qilib bo'lmaydi!
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-danger flex-1 justify-center"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function RestaurantsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [search, setSearch] = useState("");

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });

  const toggleActive = useMutation({
    mutationFn: (r: Restaurant) =>
      restaurantApi.update(r.id, { is_active: !r.is_active }),
    onSuccess: (_, r) => {
      qc.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success(r.is_active ? "Nofaol qilindi" : "Faollashtirildi");
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Xato"),
  });

  const filtered =
    restaurants?.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.address?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <DashboardLayout>
      <div className="animate-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Restoranlar
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Jami: {restaurants?.length ?? 0} ta
            </p>
          </div>
          <button
            onClick={() => setModal("create")}
            className="btn-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Yangi restoran
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
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

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Yuklanmoqda...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Building2
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
                {search ? "Topilmadi" : "Hech qanday restoran yo'q"}
              </p>
              {!search && (
                <button
                  onClick={() => setModal("create")}
                  className="btn-primary mt-4 mx-auto"
                >
                  <Plus className="w-4 h-4" /> Birinchi restoranni yaratish
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>Manzil</th>
                    <th>Holat</th>
                    <th>Yaratilgan</th>
                    <th style={{ textAlign: "right" }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {r.logo_url ? (
                            <img
                              src={r.logo_url}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).style.display =
                                  "none")
                              }
                            />
                          ) : (
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: "var(--accent-glow)" }}
                            >
                              <Building2
                                className="w-3.5 h-3.5"
                                style={{ color: "var(--accent)" }}
                              />
                            </div>
                          )}
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {r.address || "—"}
                      </td>
                      <td>
                        {r.is_active ? (
                          <div className="badge-active">
                            <CheckCircle className="w-3 h-3" /> Faol
                          </div>
                        ) : (
                          <div className="badge-inactive">
                            <XCircle className="w-3 h-3" /> Nofaol
                          </div>
                        )}
                      </td>
                      <td
                        className="mono text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(r.created_at).toLocaleDateString("uz-UZ")}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleActive.mutate(r)}
                            className="btn-icon"
                            title={r.is_active ? "Nofaol qilish" : "Faollashtirish"}
                          >
                            {r.is_active ? (
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
                              setSelected(r);
                              setModal("edit");
                            }}
                            className="btn-icon"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelected(r);
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
        <RestaurantModal onClose={() => setModal(null)} />
      )}
      {modal === "edit" && selected && (
        <RestaurantModal
          restaurant={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
      {modal === "delete" && selected && (
        <DeleteConfirm
          restaurant={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
