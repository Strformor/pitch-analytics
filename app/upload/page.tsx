"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import Navbar from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import { useStore } from "@/lib/store";
import { Player } from "@/lib/types";

export default function UploadPage() {
  const router = useRouter();
  const { setPlayers, setFileName } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Player[]>([]);
  const [currentFile, setCurrentFile] = useState("");

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
        setPreview(rows.slice(0, 5));
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

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        <Navbar />

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "var(--muted)" }}>
            [ DATA UPLOAD ]
          </h1>

          {/* Drop zone */}
          <div
            className="card p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            style={{
              borderColor: dragging ? "var(--accent)" : "var(--border)",
              background: dragging ? "var(--accent-dim)" : "var(--bg2)",
              minHeight: 260,
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-5xl mb-4" style={{ color: "var(--accent)" }}>
              {dragging ? "⬇" : "📂"}
            </div>
            <p className="text-sm tracking-widest uppercase mb-2" style={{ color: "var(--accent)" }}>
              {currentFile || "Drop CSV here or click to browse"}
            </p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Supports: PlayerID, Name, Position, Age, Nationality, Appearances, Goals, Assists, YellowCards, RedCards, MinutesPlayed
            </p>
          </div>

          {error && (
            <p className="mt-4 text-xs tracking-widest" style={{ color: "#ff4d4d" }}>
              ⚠ {error}
            </p>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--muted)" }}>
                Preview ({preview.length} of {preview.length} rows shown)
              </h2>
              <div className="card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Name", "Position", "Age", "Appearances", "Goals", "Assists", "Cards"].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left tracking-widest uppercase"
                          style={{ color: "var(--accent)" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p) => (
                      <tr
                        key={p.PlayerID}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td className="px-3 py-2" style={{ color: "var(--text)" }}>{p.Name}</td>
                        <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.Position}</td>
                        <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.Age}</td>
                        <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.Appearances}</td>
                        <td className="px-3 py-2" style={{ color: "var(--accent)" }}>{p.Goals}</td>
                        <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.Assists}</td>
                        <td className="px-3 py-2" style={{ color: "var(--muted)" }}>
                          {p.YellowCards}Y / {p.RedCards}R
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  className="btn-primary px-8 py-3 text-sm tracking-widest"
                  onClick={() => router.push("/insights")}
                >
                  VIEW INSIGHTS →
                </button>
                <button
                  className="btn-outline px-6 py-3 text-sm tracking-widest"
                  onClick={() => {
                    setPreview([]);
                    setCurrentFile("");
                    setPlayers([]);
                    setFileName("");
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
