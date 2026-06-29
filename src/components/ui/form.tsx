import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-1.5", className)} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => {
  return (
    <Label ref={ref} className={cn("block text-xs font-bold text-foreground", className)} {...props}>
      {children} {required && <span className="text-red-500">*</span>}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null;
  return (
    <p
      ref={ref}
      className={cn("text-[11px] font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

interface FormFieldProps {
  label: React.ReactNode;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FormField({ label, required, error, children, className }: FormFieldProps) {
  return (
    <FormItem className={className}>
      <FormLabel required={required}>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage>{error}</FormMessage>
    </FormItem>
  );
}

export { FormItem, FormLabel, FormControl, FormMessage, FormField };
