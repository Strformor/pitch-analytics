"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    sessionStorage.removeItem("sa_auth");
    router.push("/");
  }

  const links = [
    { href: "/upload", label: "UPLOAD" },
    { href: "/insights", label: "INSIGHTS" },
  ];

  return (
    <nav
      className="flex items-center justify-between px-6 py-3 border-b"
      style={{ background: "var(--bg2)", borderColor: "var(--border)" }}
    >
      <Link href="/upload" className="flex items-center gap-2">
        <span
          className="text-lg font-black tracking-widest"
          style={{ color: "var(--accent)", textShadow: "0 0 10px #39ffb455" }}
        >
          ⚽ PITCH
        </span>
        <span className="text-xs tracking-widest hidden sm:block" style={{ color: "var(--muted)" }}>
          ANALYTICS
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-xs tracking-widest transition-colors"
            style={{
              color: pathname === href ? "var(--accent)" : "var(--muted)",
              borderBottom: pathname === href ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1 text-xs tracking-widest btn-outline"
        >
          EXIT
        </button>
      </div>
    </nav>
  );
}
