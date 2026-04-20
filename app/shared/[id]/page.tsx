"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, PieChart, Pie, Cell,
} from "recharts";
import { Player } from "@/lib/types";

const COLORS = ["#39ffb4", "#00c97a", "#006640", "#ff7c43", "#ffd166", "#a8dadc"];

function shortName(name: string) {
  const parts = name.split(" ");
  return parts.length > 1 ? `${parts[0][0]}. ${parts[parts.length - 1]}` : name;
}

export default function SharedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [players, setPlayers] = useState<Player[]>([]);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/shared/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError("Snapshot not found."); return; }
        setPlayers(d.players);
        setLabel(d.label || "");
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  const tooltipStyle = { background: "#0f1a0f", border: "1px solid #39ffb433", color: "#e8f5e8", fontFamily: "Courier New", fontSize: 12 };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="text-sm tracking-widest" style={{ color: "var(--accent)" }}>LOADING SNAPSHOT...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="text-sm tracking-widest" style={{ color: "#ff4d4d" }}>⚠ {error}</p>
      </div>
    );
  }

  const goalsData = [...players].sort((a, b) => b.Goals - a.Goals).map((p) => ({
    name: shortName(p.Name), Goals: p.Goals, Assists: p.Assists,
  }));

  const effData = players.map((p) => ({
    name: shortName(p.Name),
    efficiency: p.MinutesPlayed > 0 ? +((p.Goals + p.Assists) / (p.MinutesPlayed / 90)).toFixed(2) : 0,
  })).sort((a, b) => b.efficiency - a.efficiency);

  const positions: Record<string, number> = {};
  players.forEach((p) => { positions[p.Position] = (positions[p.Position] || 0) + 1; });
  const posData = Object.entries(positions).map(([name, value]) => ({ name, value }));

  const scatterData = players.map((p) => ({ x: p.Appearances, y: p.Goals, name: p.Name }));

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="fixed top-0 left-0 right-0 h-1" style={{ background: "var(--accent)", opacity: 0.6 }} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-2xl font-black tracking-widest" style={{ color: "var(--accent)", textShadow: "0 0 10px #39ffb455" }}>
              ⚽ PITCH
            </div>
            <p className="text-xs tracking-widest" style={{ color: "var(--muted)" }}>
              SHARED SNAPSHOT · {label || id}
            </p>
          </div>
          <div className="card px-4 py-2 text-xs tracking-widest" style={{ color: "var(--muted)" }}>
            {players.length} PLAYERS
          </div>
        </div>

        {/* Summary bar */}
        <div className="card p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Top Scorer", value: [...players].sort((a, b) => b.Goals - a.Goals)[0]?.Name },
            { label: "Most Assists", value: [...players].sort((a, b) => b.Assists - a.Assists)[0]?.Name },
            { label: "Total Goals", value: players.reduce((s, p) => s + p.Goals, 0) },
            { label: "Total Assists", value: players.reduce((s, p) => s + p.Assists, 0) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--muted)" }}>{label}</p>
              <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goals & Assists */}
          <div className="card p-4">
            <h2 className="text-xs tracking-widest uppercase mb-3 pb-2" style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>Goals & Assists</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={goalsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6b8f6b" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Goals" fill="#39ffb4" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Assists" fill="#006640" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency */}
          <div className="card p-4">
            <h2 className="text-xs tracking-widest uppercase mb-3 pb-2" style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>Efficiency (G+A/90)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={effData} layout="vertical" margin={{ top: 0, right: 8, left: 40, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#6b8f6b" }} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} G+A/90`, "Efficiency"]} />
                <Bar dataKey="efficiency" fill="#39ffb4" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Position breakdown */}
          <div className="card p-4">
            <h2 className="text-xs tracking-widest uppercase mb-3 pb-2" style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>Position Breakdown</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={posData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {posData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Appearances vs Goals */}
          <div className="card p-4">
            <h2 className="text-xs tracking-widest uppercase mb-3 pb-2" style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>Appearances vs Goals</h2>
            <ResponsiveContainer width="100%" height={180}>
              <ScatterChart margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="x" name="Appearances" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
                <YAxis dataKey="y" name="Goals" tick={{ fontSize: 10, fill: "#6b8f6b" }} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={tooltipStyle}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div style={{ ...tooltipStyle, padding: "6px 10px", fontSize: 11 }}>
                        <p>{d.name}</p><p>Apps: {d.x} · Goals: {d.y}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#39ffb4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "var(--muted)" }}>
          PITCH · Soccer Analytics Platform
        </p>
      </div>
    </div>
  );
}
