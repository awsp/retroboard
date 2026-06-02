import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<
    Array<{
      style: React.CSSProperties;
      trailLength: number;
      speedClass: string;
      trailAnimationName: string;
    }>
  >([]);

  useEffect(() => {
    const styles = [...new Array(number)].map(() => {
      const random = Math.random();
      const baseDuration = (random * 3 + 2) * 1.35;
      let duration;
      let speedClass = "animate-meteor-medium";
      let trailAnimationName = "meteor-trail-medium";

      const dropDuration =
        baseDuration < 4
          ? Math.random() * 2 + 2
          : baseDuration > 5.4
            ? Math.random() * 1.275 + 2.55
            : (Math.random() * 2 + 4) * 0.9;

      const pauseDuration = Math.random() * 5 + 3;
      duration = dropDuration + pauseDuration;

      if (baseDuration < 4) {
        speedClass = "animate-meteor-fast";
        trailAnimationName = "meteor-trail-fast";
      } else if (baseDuration > 5.4) {
        speedClass = "animate-meteor-slow";
        trailAnimationName = "meteor-trail-slow";
      }

      const trailLength = Math.floor(250 - duration * 15);

      // Generate natural variation using pseudo-noise
      const seed = random * 1000;
      const noiseX = Math.sin(seed) * 30;
      const noiseY = Math.cos(seed * 1.5) * 20;

      // Vary the easing curve naturally for each meteor
      const easeP1 = 0.45 + Math.random() * 0.2;
      const easeP2 = 0.35 + Math.random() * 0.3;
      const easingCurve = `cubic-bezier(${easeP1}, 0, ${easeP2}, 1)`;

      return {
        style: {
          top:
            Math.floor(Math.random() * (window.innerHeight / 2) + noiseY) +
            "px",
          left: Math.floor(Math.random() * window.innerWidth + noiseX) + "px",
          animationDelay: Math.random() * dropDuration + "s",
          animationDuration: duration + "s",
          animationTimingFunction: easingCurve,
        },
        trailLength,
        speedClass,
        trailAnimationName,
      };
    });
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {meteorStyles.map(
        ({ style, trailLength, speedClass, trailAnimationName }, idx) => (
          <span
            key={idx}
            className={cn(
              "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] rounded-[9999px] bg-slate-300 shadow-[0_0_0_1px_#ffffff08]",
              speedClass,
              className,
            )}
            style={style}
          >
            <div
              className="pointer-events-none absolute top-1/2 left-0 -z-10 h-[1px] -translate-y-1/2 bg-gradient-to-r from-slate-300 to-transparent origin-left will-change-transform"
              style={
                {
                  width: `${trailLength}px`,
                  animation: `${trailAnimationName} ${style.animationDuration} infinite both`,
                  animationDelay: style.animationDelay as string,
                  animationTimingFunction:
                    style.animationTimingFunction as string,
                } as React.CSSProperties
              }
            />
          </span>
        ),
      )}
    </>
  );
};
