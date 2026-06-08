import React, { useEffect, useState } from "react";
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
    const generateStyles = () =>
      [...new Array(number)].map(() => {
        const random = Math.random();
        const baseDuration = (random * 3 + 2) * 1.35;
        let duration;
        let speedClass = "animate-meteor-medium";
        let trailAnimationName = "meteor-trail-medium";

        const dropDuration =
          baseDuration < 4
            ? Math.random() * 2 + 2
            : baseDuration > 5.4
              ? Math.random() * 0.7171875 + 1.434375
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

        // Vary the easing curve naturally for each meteor (quick acceleration, gradual slowdown)
        const x1 = 0.2 + Math.random() * 0.1; // 0.2-0.3
        const y1 = 0.8 + Math.random() * 0.15; // 0.8-0.95 (high y = steep initial rise)
        const x2 = 0.7 + Math.random() * 0.2; // 0.7-0.9
        const y2 = 1; // ends smoothly
        const easingCurve = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

        // Vary the angle slightly for natural variation
        const angleVariation = (Math.random() - 0.5) * 30; // -15 to +15 degrees
        const rotation = 215 + angleVariation;

        return {
          style: {
            top:
              Math.floor(Math.random() * (window.innerHeight / 2) + noiseY) +
              "px",
            left: Math.floor(Math.random() * window.innerWidth + noiseX) + "px",
            animationDelay: Math.random() * dropDuration + "s",
            animationDuration: duration + "s",
            animationTimingFunction: easingCurve,
            transform: `rotate(${rotation}deg)`,
          },
          trailLength,
          speedClass,
          trailAnimationName,
        };
      });

    setMeteorStyles(generateStyles());

    // Regenerate positions after the longest possible cycle
    const intervalId = setInterval(() => {
      setMeteorStyles(generateStyles());
    }, 15000); // 15 seconds to cover longest cycle (max ~13s drop+pause)

    return () => clearInterval(intervalId);
  }, [number]);

  return (
    <>
      {meteorStyles.map(
        ({ style, trailLength, speedClass, trailAnimationName }, idx) => (
          <span
            key={idx}
            className={cn(
              "pointer-events-none absolute h-0.5 w-0.5 rounded-[9999px] bg-slate-300 shadow-[0_0_0_1px_#ffffff08]",
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
