import { cn } from "@/lib/cn";

/** CSS-driven infinite marquee. Content is duplicated for a seamless loop;
 *  pauses on hover and fades at the edges. */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn("marquee-mask pause-on-hover overflow-hidden", className)}
    >
      <div
        className="flex w-max animate-marquee gap-5 pr-5"
        style={
          {
            "--marquee-duration": `${duration}s`,
            animationDirection: reverse ? "reverse" : undefined,
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-5">{children}</div>
        <div className="flex shrink-0 items-center gap-5" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
