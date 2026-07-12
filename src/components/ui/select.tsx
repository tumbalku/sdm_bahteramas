import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, options, placeholder, ...props }, ref) => {
    const selectedValue = props.value ?? props.defaultValue;
    const selectedLabel = React.useMemo(() => {
      if (selectedValue === undefined || selectedValue === null || selectedValue === "") {
        return placeholder;
      }

      const stringValue = String(selectedValue);
      const optionLabel = options?.find((opt) => opt.value === stringValue)?.label;
      if (optionLabel) return optionLabel;

      const childOption = React.Children.toArray(children).find(
        (child) => React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child) && child.props.value === stringValue
      );

      if (React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(childOption)) {
        const childLabel = childOption.props.children;
        if (typeof childLabel === "string" || typeof childLabel === "number") {
          return String(childLabel);
        }
      }

      return stringValue;
    }, [children, options, placeholder, selectedValue]);

    return (
      <div className="relative w-full">
        <span className="pointer-events-none absolute left-3.5 right-10 top-1/2 z-10 -translate-y-1/2 truncate text-sm text-foreground">
          {selectedLabel}
        </span>
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-2 pr-10 text-sm text-transparent ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer [&>option]:bg-background [&>option]:text-foreground",
            className,
            "text-transparent"
          )}
          ref={ref}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="absolute right-3.5 top-3.5 h-4 w-4 opacity-50 pointer-events-none text-muted-foreground" />
      </div>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-between", className)} {...props}>
    {children}
  </div>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="truncate">{placeholder}</span>
);

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option ref={ref} className={cn("py-1.5", className)} {...props}>
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
