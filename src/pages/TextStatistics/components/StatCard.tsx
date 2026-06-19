interface StatCardProps {
  label: string;
  value: React.ReactNode;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col justify-center items-center p-4 text-center rounded-xl border border-border bg-card shadow-sm text-card-foreground hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50 focus-within:ring-1 focus-within:ring-ring">
      <span className="text-xs font-medium text-muted-foreground tracking-wider mb-1 select-none">
        {label}
      </span>
      <span className="font-mono text-lg md:text-2xl font-extrabold text-primary break-all tracking-tight leading-none tabular-nums select-all">
        {value}
      </span>
    </div>
  );
}
