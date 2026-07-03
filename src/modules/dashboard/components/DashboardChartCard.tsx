import { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function DashboardChartCard({
  title,
  description,
  children,
  className = "",
}: DashboardChartCardProps) {
  return (
    <section className={`bg-card border border-border rounded-xl p-3 shadow-sm min-h-[250px] ${className}`}>
      <div className="mb-2.5">
        <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      {children}
    </section>
  );
}
