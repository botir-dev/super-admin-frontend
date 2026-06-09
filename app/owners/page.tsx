"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerApi, restaurantApi } from "@/lib/services";
import type { Owner, Restaurant } from "@/types";
import toast from "react-hot-toast";
import {
  Crown,
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
  Building2,
} from "lucide-react";
import { useState } from "react";

// ─── Create/Edit Modal ────────────────────────────────────────
function OwnerModal({
  owner,
  restaurants,
  onClose,
}: {
  owner?: Owner;
  restaurants: Restaurant[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    restaurant_id: owner?.restaurant_id ?? "",
    full_name: owner?.full_name ?? "",
    username: owner?.username ?? "",
    phone: owner?.phone ?? "",
    password: "",
    telegram_chat_id: owner?.telegram_chat_id ?? "",
  });
  const [showPass, setShowPass] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      if (owner) {
        const data: any = {
          full_name: form.full_name,
          phone: form.phone || undefined,
          telegram_chat_id: form.telegram_chat_id || undefined,
        };
        return ownerApi.update(owner.id, data);
      }
      return ownerApi.create({
        restaurant_id: form.restaurant_id,
        full_name: form.full_name,
        username: form.username,
        phone: form.phone || undefined,
        password: form.password,
        telegram_chat_id: form.telegram_chat_id || undefined,
      });
    },
    onSuccess: () => {
      toast.success(owner ? "Owner yangilandi" : "Owner yaratildi");
      qc.invalidateQueries({ queryKey: ["owners"] });
      onClose();
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || "Xatolik yuz berdi"),
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isValid =
    !!form.full_name &&
    (owner ? true : !!form.username && !!form.password && !!form.restaurant_id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            {owner ? "Owner tahrirlash" : "Yangi owner"}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Restoran — faqat yaratishda */}
          {!owner && (
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Restoran *
              </label>
              <select
                value={form.restaurant_id}
                onChange={(e) => set("restaurant_id", e.target.value)}
                className="input w-full"
              >
                <option value="">Tanlang...</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {form.restaurant_id && (
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  ⚠️ Bir restoranda faqat bitta owner bo'lishi mumkin
                </p>
              )}
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              To'liq ism *
            </label>
            <input
              className="input w-full"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Abdullayev Akbar"
            />
          </div>

          {!owner && (
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Username *
              </label>
              <input
                className="input w-full"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
                placeholder="owner_akbar"
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Telefon
            </label>
            <input
              className="input w-full"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+998901234567"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Telegram Chat ID (ixtiyoriy)
            </label>
            <input
              className="input w-full mono"
              value={form.telegram_chat_id}
              onChange={(e) => set("telegram_chat_id", e.target.value)}
              placeholder="Masalan: 123456789"
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              2FA uchun — owner Telegram botdan /start bosib ID olishi kerak
            </p>
          </div>

          {!owner && (
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Parol *
              </label>
              <div className="relative">
                <input
                  className="input w-full pr-10"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Kamida 8 ta belgi"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-icon"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                ⚠️ Owner parolini keyinchalik o'zgartira olmaydi
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
            className="btn-primary flex-1 justify-center"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {owner ? "Saqlash" : "Yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────
function DeleteModal({
  owner,
  onClose,
}: {
  owner: Owner;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => ownerApi.delete(owner.id),
    onSuccess: () => {
      toast.success("Owner o'chirildi");
      qc.invalidateQueries({ queryKey: ["owners"] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Xatolik"),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 border"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="font-bold text-base mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Owerni o'chirish
        </h2>
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
          <b>{owner.full_name}</b> owerni o'chirasizmi? Bu amalni qaytarib
          bo'lmaydi.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            Bekor
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-danger flex-1 justify-center"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Asosiy sahifa ────────────────────────────────────────────
export default function OwnersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editOwner, setEditOwner] = useState<Owner | undefined>();
  const [deleteOwner, setDeleteOwner] = useState<Owner | undefined>();

  const { data: restaurantsData } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurantApi.getAll().then((r) => r.data.data),
  });
  const restaurants: Restaurant[] = restaurantsData || [];

  const { data: ownersData, isLoading } = useQuery({
    queryKey: ["owners", filterRestaurant],
    queryFn: () =>
      ownerApi.getAll(filterRestaurant || undefined).then((r) => r.data.data),
  });
  const owners: Owner[] = ownersData || [];

  const toggleActive = useMutation({
    mutationFn: (o: Owner) =>
      ownerApi.update(o.id, { is_active: !o.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owners"] }),
    onError: () => toast.error("Xatolik"),
  });

  const filtered = owners.filter(
    (o) =>
      o.full_name.toLowerCase().includes(search.toLowerCase()) ||
      o.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <Crown className="w-5 h-5" style={{ color: "var(--accent)" }} />
              Ownerlar
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Restoran egalari boshqaruvi
            </p>
          </div>
          <button
            onClick={() => {
              setEditOwner(undefined);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Yangi owner
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="input w-full pl-9"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--text-muted)" }}
            />
            <select
              className="input pl-9 pr-8"
              value={filterRestaurant}
              onChange={(e) => setFilterRestaurant(e.target.value)}
            >
              <option value="">Barcha restoranlar</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Jami", value: owners.length, color: "var(--accent)" },
            {
              label: "Faol",
              value: owners.filter((o) => o.is_active).length,
              color: "var(--green)",
            },
            {
              label: "Nofaol",
              value: owners.filter((o) => !o.is_active).length,
              color: "var(--red)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 border text-center"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
            >
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
          }}
        >
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: "var(--accent)" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-16"
              style={{ color: "var(--text-muted)" }}
            >
              <Crown className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Owner topilmadi</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  {[
                    "Owner",
                    "Restoran",
                    "Username",
                    "Telefon",
                    "Holat",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "var(--bg-elevated)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background =
                        "transparent")
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            color: "var(--accent)",
                          }}
                        >
                          {o.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {o.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {o.restaurant_name || "—"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 mono text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {o.username}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {o.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive.mutate(o)}
                        disabled={toggleActive.isPending}
                        className="flex items-center gap-1.5 text-xs font-medium transition-all"
                        style={{
                          color: o.is_active ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {o.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4" />
                            Faol
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4" />
                            Nofaol
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => {
                            setEditOwner(o);
                            setShowModal(true);
                          }}
                          className="btn-icon"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteOwner(o)}
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
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <OwnerModal
          owner={editOwner}
          restaurants={restaurants}
          onClose={() => {
            setShowModal(false);
            setEditOwner(undefined);
          }}
        />
      )}
      {deleteOwner && (
        <DeleteModal
          owner={deleteOwner}
          onClose={() => setDeleteOwner(undefined)}
        />
      )}
    </DashboardLayout>
  );
}
