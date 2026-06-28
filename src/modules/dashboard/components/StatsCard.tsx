import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ title, value, icon: Icon, description, className = "", iconClassName = "" }: StatsCardProps) {
  return (
    <div className={`bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-2xl flex items-center justify-center ${iconClassName}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl z-0 pointer-events-none" />
    </div>
  );
}
