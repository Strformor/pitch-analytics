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
import InsightCard from "@/components/InsightCard";
import { useStore } from "@/lib/store";
import { Player } from "@/lib/types";

const COLORS = ["#39ffb4", "#00c97a", "#006640", "#ff7c43", "#ffd166", "#a8dadc"];

function shortName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name;
}

function GoalsChart({ players }: { players: Player[] }) {
  const data = [...players].sort((a, b) => b.Goals - a.Goals).map((p) => ({
    name: shortName(p.Name),
    Goals: p.Goals,
    Assists: p.Assists,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <YAxis tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <Tooltip
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
        />
        <Bar dataKey="Goals" fill="#39ffb4" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Assists" fill="#006640" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EfficiencyChart({ players }: { players: Player[] }) {
  const data = players.map((p) => ({
    name: shortName(p.Name),
    efficiency: p.MinutesPlayed > 0
      ? +((p.Goals + p.Assists) / (p.MinutesPlayed / 90)).toFixed(2)
      : 0,
  })).sort((a, b) => b.efficiency - a.efficiency);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6b8f6b" }} width={60} />
        <Tooltip
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
          formatter={(v) => [`${v} G+A/90`, "Efficiency"]}
        />
        <Bar dataKey="efficiency" fill="#39ffb4" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AppearancesVsGoals({ players }: { players: Player[] }) {
  const data = players.map((p) => ({
    x: p.Appearances,
    y: p.Goals,
    name: p.Name,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="x" name="Appearances" tick={{ fontSize: 10, fill: "#6b8f6b" }} label={{ value: "Apps", position: "insideBottom", offset: -2, fontSize: 10, fill: "#6b8f6b" }} />
        <YAxis dataKey="y" name="Goals" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background: "#0f1a0f", border: "1px solid #39ffb433", padding: "6px 10px", fontSize: 11, fontFamily: "Courier New", color: "#e8f5e8" }}>
                <p>{d.name}</p>
                <p>Apps: {d.x} · Goals: {d.y}</p>
              </div>
            );
          }}
        />
        <Scatter data={data} fill="#39ffb4" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function DisciplineChart({ players }: { players: Player[] }) {
  const data = players.map((p) => ({
    name: shortName(p.Name),
    Yellow: p.YellowCards,
    Red: p.RedCards,
  })).sort((a, b) => (b.Yellow + b.Red * 3) - (a.Yellow + a.Red * 3));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <YAxis tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <Tooltip
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
        />
        <Bar dataKey="Yellow" fill="#ffd166" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Red" fill="#ff4d4d" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PositionChart({ players }: { players: Player[] }) {
  const counts: Record<string, number> = {};
  players.forEach((p) => { counts[p.Position] = (counts[p.Position] || 0) + 1; });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
        />
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

  const selectStyle = {
    background: "#0a140a",
    border: "1px solid #39ffb433",
    color: "#e8f5e8",
    fontFamily: "Courier New",
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select value={a} onChange={(e) => setA(e.target.value)} style={selectStyle}>
          {players.map((p) => <option key={p.PlayerID} value={p.Name}>{p.Name}</option>)}
        </select>
        <span style={{ color: "var(--muted)", fontSize: 11, alignSelf: "center" }}>vs</span>
        <select value={b} onChange={(e) => setB(e.target.value)} style={selectStyle}>
          {players.map((p) => <option key={p.PlayerID} value={p.Name}>{p.Name}</option>)}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#39ffb422" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
          <Radar name={a} dataKey={a} stroke="#39ffb4" fill="#39ffb4" fillOpacity={0.2} />
          <Radar name={b} dataKey={b} stroke="#ffd166" fill="#ffd166" fillOpacity={0.2} />
          <Legend wrapperStyle={{ fontSize: 10, fontFamily: "Courier New", color: "#6b8f6b" }} />
          <Tooltip
            contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function MinutesChart({ players }: { players: Player[] }) {
  const data = [...players]
    .sort((a, b) => b.MinutesPlayed - a.MinutesPlayed)
    .map((p) => ({ name: shortName(p.Name), minutes: p.MinutesPlayed }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6b8f6b" }} width={60} />
        <Tooltip
          contentStyle={{ background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 }}
          formatter={(v) => [`${v} min`, "Minutes"]}
        />
        <Bar dataKey="minutes" fill="#00c97a" radius={[0, 2, 2, 0]} />
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
      const url = `${window.location.origin}/shared/${id}`;
      setShareUrl(url);
    } catch {
      setShareError("Share failed — check Supabase config.");
    } finally {
      setSharing(false);
    }
  }

  const noData = players.length === 0;

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <Navbar />

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xs tracking-[0.3em] uppercase" style={{ color: "var(--muted)" }}>
                [ INSIGHTS DASHBOARD ]
              </h1>
              {fileName && (
                <p className="text-xs mt-1" style={{ color: "var(--accent)" }}>
                  {fileName} · {players.length} players
                </p>
              )}
            </div>

            <div className="flex gap-3 items-center">
              {shareUrl ? (
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="text-xs px-3 py-2 w-56"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    style={{ background: "#0a140a", border: "1px solid var(--border)", color: "var(--accent)" }}
                  />
                  <button
                    className="btn-outline px-3 py-2 text-xs tracking-widest"
                    onClick={() => navigator.clipboard.writeText(shareUrl)}
                  >
                    COPY
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary px-6 py-2 text-xs tracking-widest"
                  onClick={handleShare}
                  disabled={sharing || noData}
                >
                  {sharing ? "UPLOADING..." : "⬆ SHARE"}
                </button>
              )}
            </div>
          </div>

          {shareError && (
            <p className="text-xs mb-4 tracking-widest" style={{ color: "#ff4d4d" }}>⚠ {shareError}</p>
          )}

          {noData ? (
            <div className="card p-16 text-center">
              <p className="text-sm tracking-widest uppercase" style={{ color: "var(--muted)" }}>
                No data loaded.
              </p>
              <button
                className="btn-primary mt-4 px-8 py-3 text-sm tracking-widest"
                onClick={() => router.push("/upload")}
              >
                UPLOAD CSV
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InsightCard title="Goals & Assists by Player">
                <GoalsChart players={players} />
              </InsightCard>

              <InsightCard title="Player Efficiency (G+A per 90)">
                <EfficiencyChart players={players} />
              </InsightCard>

              <InsightCard title="Appearances vs Goals">
                <AppearancesVsGoals players={players} />
              </InsightCard>

              <InsightCard title="Player Comparison">
                <PlayerComparison players={players} />
              </InsightCard>

              <InsightCard title="Discipline (Cards)">
                <DisciplineChart players={players} />
              </InsightCard>

              <InsightCard title="Minutes Played">
                <MinutesChart players={players} />
              </InsightCard>
            </div>
          )}

          {/* Stat summary strip */}
          {!noData && (
            <div className="mt-6 card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: "Top Scorer", value: [...players].sort((a, b) => b.Goals - a.Goals)[0]?.Name },
                { label: "Most Assists", value: [...players].sort((a, b) => b.Assists - a.Assists)[0]?.Name },
                { label: "Most Minutes", value: [...players].sort((a, b) => b.MinutesPlayed - a.MinutesPlayed)[0]?.Name },
                { label: "Total Goals", value: players.reduce((s, p) => s + p.Goals, 0) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>{label}</p>
                  <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
