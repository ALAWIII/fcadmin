import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  rounded?: string; // e.g. "rounded-[50px]" or "rounded-2xl"
  shadow?: string; // e.g. "shadow-[0px_10px_50px_rgba(0,0,0,0.5)]"
  blur?: string; // e.g. "backdrop-blur-2xl" or "backdrop-blur-md"
  border?: string; // e.g. "border border-white/20"
  gradient?: string; // e.g. "bg-gradient-to-br from-white/50 via-white/0 to-white/40"
  padding?: string;
  size?: string; // e.g. "max-w-[50%] min-w-[30%] h-1/2"
}

export function GlassCard({
  children,
  className = "",
  rounded = "rounded-[20px]",
  shadow = "shadow-[0px_10px_50px_rgba(0,0,0,0.5)]",
  blur = "backdrop-blur-xs",
  border = "border border-white/20",
  gradient = `bg-linear-to-br from-white/50 via-white/0 to-white/40
              bg-linear-to-tr from-white/50 via-white/1 to-white/40`,
  padding = "p-8",
  size = "",
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-transparent",
        border,
        rounded,
        shadow,
        blur,
        gradient,
        padding,
        size,
        className, // 👈 last = wins on conflict
      )}
    >
      {children}
    </div>
  );
}
