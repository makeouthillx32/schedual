"use client";

interface DetailRowProps {
  label: string;
  value: string;
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="font-bold shrink-0 w-24 text-[hsl(var(--muted-foreground))]">{label}:</span>
      <span className="text-[hsl(var(--foreground))] break-words">{value}</span>
    </div>
  );
}