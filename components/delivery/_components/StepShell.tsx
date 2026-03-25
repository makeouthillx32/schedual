// components/delivery/_components/StepShell.tsx

interface StepShellProps {
  title:    string;
  sub:      string;
  children: React.ReactNode;
}

/**
 * Cal.com StepHeader pattern.
 * Large bold title + muted subtitle, then children below.
 */
export function StepShell({ title, sub, children }: StepShellProps) {
  return (
    <div>
      <div className="mb-6">
        <p className="font-bold text-[22px] leading-tight text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
      {children}
    </div>
  );
}