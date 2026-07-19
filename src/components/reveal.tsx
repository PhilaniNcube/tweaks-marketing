import { type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  variant?: "up" | "fade";
}

export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  variant = "up",
}: RevealProps) {
  const style: CSSProperties | undefined = delay
    ? { animationDelay: `${delay}ms` }
    : undefined;
  return (
    <Tag
      className={cn(
        variant === "up" ? "reveal-fade-up" : "reveal-fade",
        className,
      )}
      style={style}
    >
      {children}
    </Tag>
  );
}
