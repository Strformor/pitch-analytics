"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/upload", label: "Upload" },
  { href: "/insights", label: "Insights" },
  { href: "/scout", label: "Scout" },
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
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7,7,7,0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: 56,
      gap: 32,
    }}>
      {/* Wordmark */}
      <Link href="/upload" style={{
        fontFamily: 'var(--sans)',
        fontWeight: 700,
        fontSize: 18,
        letterSpacing: '-0.02em',
        color: 'var(--text)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        PITCH
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 8,
          letterSpacing: '0.15em',
          color: 'var(--accent)',
          border: '1px solid var(--border)',
          padding: '2px 6px',
        }}>
          2025/26
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 0, flex: 1 }}>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: active ? 'var(--accent)' : 'var(--muted)',
              textDecoration: 'none',
              padding: '0 16px',
              height: 56,
              display: 'flex',
              alignItems: 'center',
              borderBottom: active ? '1px solid var(--accent)' : '1px solid transparent',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => !active && ((e.target as HTMLElement).style.color = 'var(--text-dim)')}
            onMouseLeave={e => !active && ((e.target as HTMLElement).style.color = 'var(--muted)')}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Exit */}
      <button onClick={handleLogout} style={{
        fontFamily: 'var(--mono)',
        fontSize: 10,
        letterSpacing: '0.15em',
        color: 'var(--muted)',
        background: 'transparent',
        border: '1px solid var(--border)',
        padding: '6px 14px',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        (e.target as HTMLElement).style.color = 'var(--text)'
        ;(e.target as HTMLElement).style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        (e.target as HTMLElement).style.color = 'var(--muted)'
        ;(e.target as HTMLElement).style.borderColor = 'var(--border)'
      }}
      >
        EXIT
      </button>
    </nav>
  );
}
