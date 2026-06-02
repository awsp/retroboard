import { cn } from "@/lib/utils";
import React from "react";

interface BacklightProps {
  blur?: number;
  children: React.ReactElement;
  className?: string;
}

export function Backlight({ blur = 20, children, className }: BacklightProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Background glow effect */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          filter: `blur(${blur}px)`,
          opacity: 0.5,
        }}
      >
        {React.cloneElement(children, {
          ...children.props,
          className: cn(children.props.className, "w-full h-full object-cover"),
        })}
      </div>

      {/* Actual content */}
      {children}
    </div>
  );
}
