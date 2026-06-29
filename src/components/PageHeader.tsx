import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, description, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground tracking-tight">
          {Icon && <Icon className="w-6 h-6 text-primary shrink-0" />}
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {action || children}
        </div>
      )}
    </div>
  );
}
