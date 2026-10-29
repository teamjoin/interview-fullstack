import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span className={`ui-badge ui-badge--${tone}`}>
      <span className="ui-badge__dot" />
      {children}
    </span>
  );
}
