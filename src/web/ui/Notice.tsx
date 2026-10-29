import type { ReactNode } from "react";
import { Icon } from "./Icon";

export function Notice({
  children,
  tone = "neutral",
  announce = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "danger";
  announce?: boolean;
}) {
  return (
    <div
      className={`ui-notice ui-notice--${tone}`}
      role={announce ? "alert" : undefined}
    >
      <Icon name={tone === "danger" ? "error" : "sparkles"} />
      <div>{children}</div>
    </div>
  );
}
