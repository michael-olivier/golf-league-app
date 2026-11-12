import type { ReactNode } from "react";

interface HomePassExpandableProps {
  open: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
}

/** Animated height expand/collapse for home pass card disclosures. */
export function HomePassExpandable({
  open,
  children,
  className = "",
  contentClassName = "",
  id,
}: HomePassExpandableProps) {
  return (
    <div
      id={id}
      className={`home-pass-expand ${open ? "is-open" : ""} ${className}`.trim()}
    >
      <div
        className={`home-pass-expand__inner ${contentClassName}`.trim()}
      >
        {children}
      </div>
    </div>
  );
}
