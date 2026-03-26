// components/delivery/_components/OptionCard.tsx
import { Check } from "lucide-react";
import { cn }    from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onClick:  () => void;
  icon:     React.ReactNode;
  label:    string;
  desc:     string;
}

/**
 * Large tap-target card — used for Pickup/Delivery toggle and Payment status.
 * Green primary border + tinted background when selected, checkmark in corner.
 */
export function OptionCard({ selected, onClick, icon, label, desc }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-5 w-full px-5 py-5 rounded-2xl border-2 text-left transition-all active:scale-95",
        selected
          ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary)/0.08)]"
          : "border-border bg-background hover:border-[hsl(var(--sidebar-primary))]",
      )}
    >
      <div className={cn("shrink-0", selected ? "text-[hsl(var(--sidebar-primary))]" : "text-muted-foreground")}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn("font-bold text-base", selected ? "text-[hsl(var(--sidebar-primary))]" : "text-foreground")}>
          {label}
        </p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {selected && <Check size={20} className="text-[hsl(var(--sidebar-primary))] shrink-0" />}
    </button>
  );
}