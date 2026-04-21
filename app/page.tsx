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
      setError("ACCESS DENIED.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Top accent line */}
      <div style={{ height: 1, background: "linear-gradient(90deg, var(--accent), transparent)" }} />

      {/* Grid lines decoration */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(57,255,180,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(57,255,180,0.03) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">

        {/* Big editorial wordmark */}
        <div className="text-center mb-16 animate-fade-up">
          <div style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(72px, 14vw, 160px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.9,
            color: 'var(--text)',
          }}>
            PITCH
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div style={{ height: 1, width: 40, background: 'var(--border-strong)' }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)' }}>
              FOOTBALL INTELLIGENCE
            </span>
            <div style={{ height: 1, width: 40, background: 'var(--border-strong)' }} />
          </div>
        </div>

        {/* Login form */}
        <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div style={{
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            padding: '32px',
          }}>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 24 }}>
              [ SECURE ACCESS ]
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--accent)', display: 'block', marginBottom: 8 }}>
                  ACCESS CODE
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: 14,
                    letterSpacing: '0.2em',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'var(--mono)',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  placeholder="········"
                  autoFocus
                />
              </div>

              {error && (
                <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#ff5555', letterSpacing: '0.1em' }}>
                  ✕ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--accent)',
                  color: '#070707',
                  fontFamily: 'var(--mono)',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.2em',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  marginTop: 8,
                }}
                onMouseEnter={e => !loading && ((e.target as HTMLElement).style.boxShadow = '0 0 24px var(--accent-glow)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.boxShadow = 'none')}
              >
                {loading ? 'VERIFYING...' : 'ENTER →'}
              </button>
            </form>
          </div>

          {/* Season badge */}
          <div className="flex justify-between mt-4" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em' }}>
            <span>PITCH v2.0</span>
            <span>SEASON 2025/26</span>
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px' }}>
        <div className="flex justify-center gap-12" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
          {['LIVE DATA', '9 LEAGUES', 'AI POWERED', 'SHARE READY'].map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
