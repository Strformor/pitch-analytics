"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password === "OPS123") {
      localStorage.setItem("sa_auth", "1");
      router.push("/upload");
    } else {
      setError("INVALID PASSWORD. TRY AGAIN.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      {/* Pixel field art strip at top */}
      <div
        className="fixed top-0 left-0 right-0 h-1"
        style={{ background: "var(--accent)", opacity: 0.6 }}
      />

      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div
            className="text-5xl font-black tracking-widest mb-2"
            style={{ color: "var(--accent)", textShadow: "0 0 20px #39ffb466" }}
          >
            ⚽ PITCH
          </div>
          <div className="text-sm tracking-[0.4em] uppercase" style={{ color: "var(--muted)" }}>
            Soccer Analytics Platform
          </div>
          <div
            className="mt-4 h-px"
            style={{ background: "var(--border)" }}
          />
        </div>

        {/* Login card */}
        <div className="card p-8">
          <h1
            className="text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: "var(--muted)" }}
          >
            [ SECURE ACCESS ]
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-xs tracking-widest uppercase mb-2"
                style={{ color: "var(--accent)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm tracking-widest"
                placeholder="••••••••"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs tracking-widest" style={{ color: "#ff4d4d" }}>
                ⚠ {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm tracking-widest mt-2"
              disabled={loading}
            >
              {loading ? "VERIFYING..." : "ENTER"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
          PITCH v1.0 · SEASON ANALYTICS
        </p>
      </div>
    </div>
  );
}
