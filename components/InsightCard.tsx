interface InsightCardProps {
  title: string;
  children: React.ReactNode;
}

export default function InsightCard({ title, children }: InsightCardProps) {
  return (
    <div className="card p-4 flex flex-col" style={{ minHeight: 280 }}>
      <h2
        className="text-xs tracking-[0.25em] uppercase mb-4 pb-2"
        style={{ color: "var(--accent)", borderBottom: "1px solid var(--border)" }}
      >
        {title}
      </h2>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
