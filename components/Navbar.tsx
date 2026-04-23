"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/upload",  label: "Upload",  num: "01" },
  { href: "/insights",label: "Insights",num: "02" },
  { href: "/scout",   label: "Scout",   num: "03" },
  { href: "/league",  label: "League",  num: "04" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("sa_auth");
    router.push("/");
  }

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(5,5,5,0.95)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "stretch",
      height: 64,
    }}>
      {/* Left accent bar */}
      <div style={{ width: 3, background: "var(--accent)", flexShrink: 0 }} />

      {/* Wordmark */}
      <Link href="/upload" style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 28px",
        borderRight: "1px solid var(--border)",
        textDecoration: "none",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--sans)",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "-0.03em",
          color: "var(--text)",
        }}>
          PITCH
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", flex: 1 }}>
        {links.map(({ href, label, num }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 24px",
              textDecoration: "none",
              borderRight: "1px solid var(--border)",
              borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
              background: active ? "rgba(57,255,180,0.04)" : "transparent",
              transition: "all 0.15s",
              position: "relative",
              marginBottom: active ? -1 : 0,
            }}
            onMouseEnter={e => {
              if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }}
            onMouseLeave={e => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
            >
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: active ? "var(--accent)" : "var(--muted)",
                opacity: 0.5,
                marginTop: 1,
              }}>{num}</span>
              <span style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: active ? "var(--accent)" : "var(--text-dim)",
                fontWeight: active ? 700 : 400,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px", borderLeft: "1px solid var(--border)" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 2s ease infinite" }} />
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.2em", color: "var(--accent)" }}>LIVE</span>
      </div>

      {/* Exit */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 24px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid var(--border)",
          cursor: "pointer",
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--muted)",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "var(--accent2)";
          e.currentTarget.style.background = "rgba(255,61,90,0.06)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "var(--muted)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ fontSize: 14 }}>⏻</span> EXIT
      </button>
    </nav>
  );
}
