"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const TICKER_ITEMS = [
  "LIVE SCOUTING DATA", "9 LEAGUES", "AI-POWERED ANALYSIS", "REAL-TIME STATS",
  "SHARE REPORTS", "2025/26 SEASON", "PREMIER LEAGUE", "LA LIGA", "SERIE A",
  "BUNDESLIGA", "LIGUE 1", "EFFICIENCY METRICS", "xG · xA · G+A/90",
];

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
      setError("ACCESS DENIED");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", overflow: "hidden", position: "relative" }}>

      {/* Pitch grid background */}
      <div className="pitch-lines" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Scanline sweep */}
      <div style={{
        position: "fixed", left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
        opacity: 0.3, zIndex: 1, top: 0,
        animation: "scanline 8s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Top bar */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.3em", color: "var(--muted)" }}>
          PITCH / FOOTBALL INTELLIGENCE SYSTEM
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--accent)" }}>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", zIndex: 10 }}>

        {/* LEFT — Editorial wordmark */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px", borderRight: "1px solid var(--border)", position: "relative" }}>

          {/* Season tag */}
          <div style={{ marginBottom: 32 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--accent)", border: "1px solid var(--border-strong)", padding: "4px 12px" }}>
              SEASON 2025/26
            </span>
          </div>

          {/* Giant wordmark */}
          <div style={{
            fontFamily: "var(--sans)",
            fontWeight: 700,
            fontSize: "clamp(88px, 12vw, 180px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.85,
            color: "var(--text)",
          }}>
            PITCH
          </div>

          {/* Subtitle */}
          <div style={{ marginTop: 24, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 320 }}>
            Football intelligence platform.<br />
            Upload squad data, discover insights,<br />
            scout the world's best players.
          </div>

          {/* Stat strip */}
          <div style={{ display: "flex", gap: 40, marginTop: 56 }}>
            {[{ n: "9", l: "Leagues" }, { n: "30+", l: "Players Live" }, { n: "AI", l: "Powered" }].map(({ n, l }) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--muted)", marginTop: 4, textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Accent line */}
          <div style={{ position: "absolute", left: 0, top: "50%", width: 3, height: 80, background: "var(--accent)", transform: "translateY(-50%)" }} />
        </div>

        {/* RIGHT — Auth form */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "60px 48px" }}>
          <div style={{ width: "100%", maxWidth: 360 }}>

            {/* Form header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--muted)", marginBottom: 8 }}>
                — RESTRICTED ACCESS
              </div>
              <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: "var(--text)" }}>
                Authenticate
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Label */}
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--accent)", marginBottom: 4 }}>
                ACCESS CODE
              </div>

              {/* Password input */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="········"
                autoFocus
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  fontSize: 18,
                  letterSpacing: "0.4em",
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent)",
                  color: "var(--text)",
                  fontFamily: "var(--mono)",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.borderLeftColor = "var(--accent)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Error */}
              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent2)", letterSpacing: "0.1em" }}>
                  <span style={{ fontSize: 16 }}>✕</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "18px",
                  background: loading ? "var(--bg3)" : "var(--accent)",
                  color: loading ? "var(--muted)" : "#050505",
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
                onMouseEnter={e => {
                  if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px var(--accent-glow)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {loading ? (
                  <>VERIFYING<span className="blink">_</span></>
                ) : (
                  <>ENTER SYSTEM <span style={{ fontSize: 18 }}>→</span></>
                )}
              </button>
            </form>

            {/* Footer note */}
            <div style={{ marginTop: 32, fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "0.15em", lineHeight: 2, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div>BUILD v2.0 · PITCH INTELLIGENCE</div>
              <div>UNAUTHORISED ACCESS PROHIBITED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{ borderTop: "1px solid var(--border)", overflow: "hidden", position: "relative", zIndex: 10, height: 36, display: "flex", alignItems: "center" }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--muted)", marginRight: 48, whiteSpace: "nowrap" }}>
              {i % 3 === 0 ? <span style={{ color: "var(--accent)", marginRight: 8 }}>◆</span> : <span style={{ marginRight: 8, opacity: 0.3 }}>·</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
