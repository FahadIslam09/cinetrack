import Image from "next/image";

interface LogoIconProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export function LogoIcon({
  className = "w-7 h-7",
  size = 32,
  priority = false,
}: LogoIconProps) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="CineTrack Logo"
        width={size * 2}
        height={size * 2}
        priority={priority}
        className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(59,158,255,0.35)] transition-transform group-hover:scale-105"
      />
    </div>
  );
}
