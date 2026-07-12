import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className={`rounded-xl p-3 sm:p-3.5 hover:shadow-sm transition-shadow relative overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-0.5">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 rounded-xl flex items-center justify-center ${iconClassName}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl z-0 pointer-events-none" />
    </Card>
  );
}
