"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useStore } from "@/lib/store";
import { Player } from "@/lib/types";

const COLORS = ["#39ffb4", "#00c97a", "#fbbf24", "#ff3d5a", "#a78bfa", "#60a5fa"];

const TOOLTIP_STYLE = {
  background: "var(--bg2)",
  border: "1px solid var(--border-strong)",
  color: "var(--text)",
  fontFamily: "var(--mono)",
  fontSize: 11,
  borderRadius: 0,
  padding: "8px 12px",
};

function shortName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name;
}

function ChartShell({ title, span = 1, children }: { title: string; span?: number; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      padding: "0",
      display: "flex",
      flexDirection: "column",
      gridColumn: span > 1 ? `span ${span}` : undefined,
    }}>
      {/* Card header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg3)",
      }}>
        <div style={{ width: 2, height: 14, background: "var(--accent)", flexShrink: 0 }} />
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "var(--accent)",
          textTransform: "uppercase",
        }}>{title}</span>
      </div>
      <div style={{ flex: 1, padding: "20px 16px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function GoalsChart({ players }: { players: Player[] }) {
  const data = [...players].sort((a, b) => b.Goals - a.Goals).slice(0, 12).map((p) => ({
    name: shortName(p.Name),
    Goals: p.Goals,
    Assists: p.Assists,
  }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <YAxis tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="Goals" fill="#39ffb4" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Assists" fill="rgba(57,255,180,0.3)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EfficiencyChart({ players }: { players: Player[] }) {
  const data = players.map((p) => ({
    name: shortName(p.Name),
    eff: p.MinutesPlayed > 0 ? +((p.Goals + p.Assists) / (p.MinutesPlayed / 90)).toFixed(2) : 0,
  })).sort((a, b) => b.eff - a.eff).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 36, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} width={60} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} G+A/90`, "Efficiency"]} />
        <Bar dataKey="eff" fill="#39ffb4" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AppearancesVsGoals({ players }: { players: Player[] }) {
  const data = players.map((p) => ({ x: p.Appearances, y: p.Goals, name: p.Name }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ScatterChart margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="x" name="Appearances" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <YAxis dataKey="y" name="Goals" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ ...TOOLTIP_STYLE }}>
                <div style={{ color: "var(--accent)", fontWeight: 700 }}>{d.name}</div>
                <div style={{ color: "var(--text-dim)", marginTop: 4 }}>Apps: {d.x} · Goals: {d.y}</div>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#39ffb4" opacity={0.85} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function DisciplineChart({ players }: { players: Player[] }) {
  const data = players.map((p) => ({
    name: shortName(p.Name),
    Yellow: p.YellowCards,
    Red: p.RedCards,
  })).sort((a, b) => (b.Yellow + b.Red * 3) - (a.Yellow + a.Red * 3)).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <YAxis tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="Yellow" fill="#fbbf24" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Red" fill="#ff3d5a" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PositionChart({ players }: { players: Player[] }) {
  const counts: Record<string, number> = {};
  players.forEach((p) => { counts[p.Position] = (counts[p.Position] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data} dataKey="value" nameKey="name"
          cx="50%" cy="50%" outerRadius={85} innerRadius={40}
          paddingAngle={2}
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Space Mono", letterSpacing: "0.1em" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PlayerComparison({ players }: { players: Player[] }) {
  const [a, setA] = useState(players[0]?.Name ?? "");
  const [b, setB] = useState(players[1]?.Name ?? "");

  const pa = players.find((p) => p.Name === a);
  const pb = players.find((p) => p.Name === b);

  const metrics = ["Goals", "Assists", "Appearances", "YellowCards"] as const;
  const radarData = metrics.map((m) => ({
    metric: m,
    [a]: pa?.[m] ?? 0,
    [b]: pb?.[m] ?? 0,
  }));

  const selectStyle: React.CSSProperties = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--mono)",
    fontSize: 11,
    padding: "6px 10px",
    outline: "none",
    cursor: "pointer",
    flex: 1,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select value={a} onChange={(e) => setA(e.target.value)} style={selectStyle}>
          {players.map((p) => <option key={p.PlayerID} value={p.Name}>{p.Name}</option>)}
        </select>
        <span style={{ color: "var(--muted)", fontSize: 11, flexShrink: 0 }}>VS</span>
        <select value={b} onChange={(e) => setB(e.target.value)} style={selectStyle}>
          {players.map((p) => <option key={p.PlayerID} value={p.Name}>{p.Name}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
          <Radar name={a} dataKey={a} stroke="#39ffb4" fill="#39ffb4" fillOpacity={0.2} />
          <Radar name={b} dataKey={b} stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.2} />
          <Legend wrapperStyle={{ fontSize: 9, fontFamily: "Space Mono" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MinutesChart({ players }: { players: Player[] }) {
  const data = [...players]
    .sort((a, b) => b.MinutesPlayed - a.MinutesPlayed)
    .slice(0, 10)
    .map((p) => ({ name: shortName(p.Name), min: p.MinutesPlayed }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 36, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "var(--muted)", fontFamily: "Space Mono" }} width={60} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} min`, "Minutes"]} />
        <Bar dataKey="min" fill="rgba(57,255,180,0.6)" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function InsightsPage() {
  const { players, fileName } = useStore();
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareError, setShareError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (!players.length) return;
    setSharing(true);
    setShareError("");
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players, label: fileName }),
      });
      if (!res.ok) throw new Error("Share failed");
      const { id } = await res.json();
      setShareUrl(`${window.location.origin}/shared/${id}`);
    } catch {
      setShareError("Share failed — check Supabase config.");
    } finally {
      setSharing(false);
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const noData = players.length === 0;
  const topScorer = [...players].sort((a, b) => b.Goals - a.Goals)[0];
  const topAssist = [...players].sort((a, b) => b.Assists - a.Assists)[0];
  const mostMinutes = [...players].sort((a, b) => b.MinutesPlayed - a.MinutesPlayed)[0];
  const totalGoals = players.reduce((s, p) => s + p.Goals, 0);
  const topEfficiency = [...players]
    .map(p => ({ ...p, eff: p.MinutesPlayed > 0 ? ((p.Goals + p.Assists) / p.MinutesPlayed) * 90 : 0 }))
    .sort((a, b) => b.eff - a.eff)[0];

  return (
    <AuthGuard>
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <Navbar />

        <main style={{ flex: 1, maxWidth: 1400, margin: "0 auto", width: "100%", padding: "0 0 80px" }}>

          {/* Page header bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 40px",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--muted)" }}>02 / ANALYTICS</div>
                <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1, marginTop: 4 }}>
                  Insights Dashboard
                </div>
              </div>
              {fileName && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", border: "1px solid var(--border)", padding: "4px 10px", marginTop: 8 }}>
                  {fileName} · {players.length} players
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {shareUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    readOnly value={shareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    style={{
                      fontFamily: "var(--mono)", fontSize: 11, padding: "8px 12px",
                      background: "var(--bg2)", border: "1px solid var(--border-strong)",
                      color: "var(--accent)", width: 240, outline: "none",
                    }}
                  />
                  <button className="btn-outline" onClick={copyUrl} style={{ padding: "8px 16px", fontSize: 10, letterSpacing: "0.15em" }}>
                    {copied ? "COPIED ✓" : "COPY"}
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleShare}
                  disabled={sharing || noData}
                  style={{ padding: "10px 24px", fontSize: 11, letterSpacing: "0.15em" }}
                >
                  {sharing ? "UPLOADING..." : "⬆ SHARE REPORT"}
                </button>
              )}
            </div>
          </div>

          {shareError && (
            <div style={{ padding: "12px 40px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent2)", letterSpacing: "0.1em", borderBottom: "1px solid var(--border)" }}>
              ⚠ {shareError}
            </div>
          )}

          {noData ? (
            /* Empty state */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 24 }}>
              <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 80, letterSpacing: "-0.04em", color: "var(--border-strong)", lineHeight: 1 }}>
                NO DATA
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.2em" }}>
                Upload a CSV to generate insights
              </div>
              <button className="btn-primary" onClick={() => router.push("/upload")} style={{ padding: "14px 32px", fontSize: 12, letterSpacing: "0.15em" }}>
                UPLOAD CSV →
              </button>
            </div>
          ) : (
            <>
              {/* KPI Hero Strip */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                borderBottom: "1px solid var(--border)",
              }}>
                {[
                  { label: "Top Scorer", value: topScorer?.Name.split(" ").pop() ?? "—", sub: `${topScorer?.Goals ?? 0} goals` },
                  { label: "Top Assist", value: topAssist?.Name.split(" ").pop() ?? "—", sub: `${topAssist?.Assists ?? 0} assists` },
                  { label: "Best G+A/90", value: topEfficiency?.Name.split(" ").pop() ?? "—", sub: `${topEfficiency?.eff.toFixed(2) ?? 0} ratio` },
                  { label: "Most Minutes", value: mostMinutes?.Name.split(" ").pop() ?? "—", sub: `${mostMinutes?.MinutesPlayed?.toLocaleString() ?? 0} min` },
                  { label: "Total Goals", value: String(totalGoals), sub: `${players.length} players` },
                ].map(({ label, value, sub }, i) => (
                  <div key={label} style={{
                    padding: "28px 28px",
                    borderRight: i < 4 ? "1px solid var(--border)" : "none",
                    position: "relative",
                  }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--muted)", marginBottom: 8, textTransform: "uppercase" }}>
                      {label}
                    </div>
                    <div style={{
                      fontFamily: "var(--sans)",
                      fontWeight: 700,
                      fontSize: "clamp(22px, 2.5vw, 36px)",
                      letterSpacing: "-0.03em",
                      color: "var(--accent)",
                      lineHeight: 1.1,
                      marginBottom: 4,
                    }}>
                      {value}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", color: "var(--muted)" }}>{sub}</div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 2, background: "linear-gradient(90deg, var(--accent), transparent)" }} />
                  </div>
                ))}
              </div>

              {/* Charts grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                background: "var(--border)",
                margin: "0",
                padding: 0,
              }}>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Goals & Assists">
                    <GoalsChart players={players} />
                  </ChartShell>
                </div>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Efficiency · G+A per 90">
                    <EfficiencyChart players={players} />
                  </ChartShell>
                </div>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Squad Depth · Appearances vs Goals">
                    <AppearancesVsGoals players={players} />
                  </ChartShell>
                </div>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Player Comparison">
                    <PlayerComparison players={players} />
                  </ChartShell>
                </div>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Discipline · Cards">
                    <DisciplineChart players={players} />
                  </ChartShell>
                </div>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Squad Positions">
                    <PositionChart players={players} />
                  </ChartShell>
                </div>
              </div>

              {/* Minutes chart — full width */}
              <div style={{ margin: "1px 0 0", background: "var(--border)", padding: 0 }}>
                <div style={{ background: "var(--bg)" }}>
                  <ChartShell title="Minutes Played · Workload Distribution">
                    <MinutesChart players={players} />
                  </ChartShell>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
