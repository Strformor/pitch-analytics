"use client";
import { useRef, useState, useEffect, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useStore } from "@/lib/store";
import { Player } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const { players: existingPlayers, setPlayers, setFileName } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Player[]>([]);
  const [currentFile, setCurrentFile] = useState("");
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Auto-load Space Cowboys squad if no squad has been uploaded yet
  useEffect(() => {
    if (existingPlayers.length > 0) return; // user already has data
    fetch("/default-squad.csv")
      .then(res => res.text())
      .then(csvText => {
        Papa.parse<Record<string, string>>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete(results) {
            const rows = results.data.map((r) => ({
              PlayerID:     Number(r.PlayerID),
              Name:         r.Name,
              Position:     r.Position,
              Age:          Number(r.Age),
              Nationality:  r.Nationality,
              Appearances:  Number(r.Appearances),
              Goals:        Number(r.Goals),
              Assists:      Number(r.Assists),
              YellowCards:  Number(r.YellowCards),
              RedCards:     Number(r.RedCards),
              MinutesPlayed: Number(r.MinutesPlayed),
            })) as Player[];
            if (rows.length && rows[0].Name) {
              setPlayers(rows);
              setFileName("space_cowboys_fc_squad.csv");
              setCurrentFile("space_cowboys_fc_squad.csv");
              setTotalPlayers(rows.length);
              setPreview(rows.slice(0, 8));
            }
          },
        });
      })
      .catch(() => { /* silently skip if fetch fails */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseFile(file: File) {
    setError("");
    setFileName(file.name);
    setCurrentFile(file.name);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data.map((r) => ({
          PlayerID: Number(r.PlayerID),
          Name: r.Name,
          Position: r.Position,
          Age: Number(r.Age),
          Nationality: r.Nationality,
          Appearances: Number(r.Appearances),
          Goals: Number(r.Goals),
          Assists: Number(r.Assists),
          YellowCards: Number(r.YellowCards),
          RedCards: Number(r.RedCards),
          MinutesPlayed: Number(r.MinutesPlayed),
        })) as Player[];

        if (!rows.length || !rows[0].Name) {
          setError("CSV format unrecognized. Check column headers.");
          return;
        }
        setPlayers(rows);
        setTotalPlayers(rows.length);
        setPreview(rows.slice(0, 8));
      },
      error() {
        setError("Failed to parse CSV file.");
      },
    });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) {
      parseFile(file);
    } else {
      setError("Only CSV files are supported.");
    }
  }

  const hasData = preview.length > 0;

  return (
    <AuthGuard>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
        <Navbar />

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: hasData ? "260px 1fr" : "1fr", transition: "all 0.3s" }}>

          {/* Sidebar — visible when data loaded */}
          {hasData && (
            <div style={{
              borderRight: "1px solid var(--border)",
              padding: "40px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 32,
              animation: "fadeIn 0.4s ease",
            }}>
              {/* Vertical label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 2, height: 40, background: "var(--accent)" }} />
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.25em", color: "var(--muted)", textTransform: "uppercase" }}>Squad Loaded</div>
                  <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", color: "var(--accent)", lineHeight: 1.1, marginTop: 4 }}>{totalPlayers}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", color: "var(--muted)" }}>PLAYERS</div>
                </div>
              </div>

              {/* File name */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--muted)", marginBottom: 6 }}>FILE</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", wordBreak: "break-all" }}>{currentFile}</div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                <button
                  className="btn-primary"
                  onClick={() => router.push("/insights")}
                  style={{ padding: "14px 20px", fontSize: 11, letterSpacing: "0.15em", textAlign: "center" }}
                >
                  VIEW INSIGHTS →
                </button>
                <button
                  className="btn-outline"
                  onClick={() => {
                    setPreview([]);
                    setCurrentFile("");
                    setTotalPlayers(0);
                    setPlayers([]);
                    setFileName("");
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  style={{ padding: "12px 20px", fontSize: 11, letterSpacing: "0.15em", textAlign: "center" }}
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}

          {/* Main area */}
          <div style={{ padding: "40px 40px 80px", display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Page header */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.3em", color: "var(--muted)", marginBottom: 6 }}>01 / DATA INPUT</div>
                <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1 }}>
                  Upload Squad
                </div>
              </div>
              {!hasData && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.15em", color: "var(--muted)" }}>
                  CSV · DRAG & DROP OR CLICK
                </span>
              )}
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg, var(--accent) 0%, transparent 60%)" }} />

            {!hasData ? (
              /* Drop zone — full page feel */
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  flex: 1,
                  minHeight: 400,
                  border: `1px solid ${dragging ? "var(--accent)" : "var(--border)"}`,
                  background: dragging ? "var(--accent-dim)" : "var(--bg2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Corner marks */}
                {["top-left", "top-right", "bottom-left", "bottom-right"].map(corner => (
                  <div key={corner} style={{
                    position: "absolute",
                    width: 20, height: 20,
                    ...(corner.includes("top") ? { top: 12 } : { bottom: 12 }),
                    ...(corner.includes("left") ? { left: 12 } : { right: 12 }),
                    borderTop: corner.includes("top") ? `2px solid ${dragging ? "var(--accent)" : "var(--border-strong)"}` : "none",
                    borderBottom: corner.includes("bottom") ? `2px solid ${dragging ? "var(--accent)" : "var(--border-strong)"}` : "none",
                    borderLeft: corner.includes("left") ? `2px solid ${dragging ? "var(--accent)" : "var(--border-strong)"}` : "none",
                    borderRight: corner.includes("right") ? `2px solid ${dragging ? "var(--accent)" : "var(--border-strong)"}` : "none",
                  }} />
                ))}

                <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleFileChange} />

                {/* Icon */}
                <div style={{
                  width: 72, height: 72,
                  border: `1px solid ${dragging ? "var(--accent)" : "var(--border-strong)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 28,
                  fontSize: 28,
                  background: dragging ? "var(--accent-dim)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  {dragging ? "⬇" : "◈"}
                </div>

                <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em", color: dragging ? "var(--accent)" : "var(--text)", marginBottom: 12 }}>
                  {dragging ? "Release to upload" : "Drop your CSV here"}
                </div>

                <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--muted)", textAlign: "center", maxWidth: 480, lineHeight: 1.8 }}>
                  Required columns: PlayerID · Name · Position · Age · Nationality<br />
                  Appearances · Goals · Assists · YellowCards · RedCards · MinutesPlayed
                </div>

                <div style={{ marginTop: 28, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--accent)", border: "1px solid var(--border-strong)", padding: "8px 20px" }}>
                  OR CLICK TO BROWSE
                </div>
              </div>
            ) : (
              /* Preview table */
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.25em", color: "var(--muted)", marginBottom: 16 }}>
                  SHOWING FIRST {preview.length} PLAYERS
                </div>

                <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--mono)" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                        {["#", "Name", "Pos", "Age", "Apps", "Goals", "Assists", "Cards"].map((h) => (
                          <th key={h} style={{
                            padding: "12px 16px",
                            textAlign: "left",
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            letterSpacing: "0.2em",
                            color: "var(--accent)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, i) => (
                        <tr key={p.PlayerID} style={{
                          borderBottom: "1px solid var(--border)",
                          background: i % 2 === 0 ? "var(--bg2)" : "var(--bg)",
                        }}>
                          <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</td>
                          <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 700 }}>{p.Name}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em",
                              padding: "2px 8px", border: "1px solid var(--border)",
                              color: "var(--text-dim)",
                            }}>{p.Position}</span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "var(--text-dim)" }}>{p.Age}</td>
                          <td style={{ padding: "12px 16px", color: "var(--text-dim)" }}>{p.Appearances}</td>
                          <td style={{ padding: "12px 16px", color: "var(--accent)", fontWeight: 700 }}>{p.Goals}</td>
                          <td style={{ padding: "12px 16px", color: "var(--text-dim)" }}>{p.Assists}</td>
                          <td style={{ padding: "12px 16px", color: "var(--text-dim)" }}>
                            <span style={{ color: "#fbbf24" }}>{p.YellowCards}Y</span>
                            {p.RedCards > 0 && <span style={{ color: "var(--accent2)", marginLeft: 6 }}>{p.RedCards}R</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {error && (
                  <div style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent2)", letterSpacing: "0.1em" }}>
                    ⚠ {error}
                  </div>
                )}
              </div>
            )}

            {/* Error (no-data state) */}
            {error && !hasData && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent2)", letterSpacing: "0.1em" }}>
                ⚠ {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
