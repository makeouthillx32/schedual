// components/delivery/_components/SummaryRow.tsx

interface SummaryRowProps {
  label: string;
  value: string;
}

/** One key/value row in the Step 7 confirm summary card. */
export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="font-semibold text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-foreground break-words flex-1">{value}</span>
    </div>
  );
}