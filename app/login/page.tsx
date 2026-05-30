"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/lib/services";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.username.trim() || !form.password) {
      setErrorMsg("Username va parolni kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(form.username.trim(), form.password);
      const data = res.data.data;

      if (data.role !== "super_admin") {
        setErrorMsg("Bu panel faqat Super Admin uchun");
        return;
      }

      setUser(data);
      toast.success(`Xush kelibsiz, ${data.full_name}!`);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setErrorMsg(
        typeof msg === "string" && msg.length < 200
          ? msg
          : "Xatolik yuz berdi. Qayta urinib ko'ring.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-sm animate-in relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 0 40px var(--accent-glow)",
            }}
          >
            <ShieldCheck
              className="w-7 h-7"
              style={{ color: "var(--accent)" }}
            />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Super Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Restoran boshqaruv tizimi
          </p>
        </div>

        {/* Card */}
        <div
          className="p-[20px] rounded-2xl"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                placeholder="super_admin"
                autoComplete="username"
                value={form.username}
                onChange={(e) =>
                  setForm((p) => ({ ...p, username: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            {errorMsg && (
              <div
                className="text-sm px-3 py-2 rounded-lg"
                style={{
                  background: "var(--red-dim)",
                  color: "var(--red)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--text-muted)" }}
        >
          Faqat super_admin roli uchun
        </p>
      </div>
    </div>
  );
}
