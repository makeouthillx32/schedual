// components/delivery/_components/Field.tsx
import { Label } from "@/components/ui/label";

interface FieldProps {
  label:     string;
  required?: boolean;
  children:  React.ReactNode;
}

/** Label + input slot wrapper. Matches Cal.com field label style. */
export function Field({ label, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
}