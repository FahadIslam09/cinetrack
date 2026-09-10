import Link from "next/link";
import {
  Rocket,
  Flame,
  Eye,
  Theater,
  Sparkles,
  Clapperboard,
  LucideIcon,
} from "lucide-react";

interface GenreCardProps {
  genre: string;
  count: string;
  iconName: "rocket" | "flame" | "eye" | "theater" | "sparkles" | "clapperboard";
  bgImage?: string;
}

const icons: Record<string, LucideIcon> = {
  rocket: Rocket,
  flame: Flame,
  eye: Eye,
  theater: Theater,
  sparkles: Sparkles,
  clapperboard: Clapperboard,
};

export function GenreCard({ genre, count, iconName, bgImage }: GenreCardProps) {
  const Icon = icons[iconName] || Clapperboard;

  return (
    <Link
      href={`/discover?genre=${encodeURIComponent(genre)}`}
      className="relative h-20 rounded-xl overflow-hidden bg-[#151C27] border border-white/[0.06] p-3 flex flex-col justify-between group transition-transform duration-200 active:scale-95 shadow-sm"
    >
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#151C27] via-[#151C27]/80 to-transparent" />

      <div className="relative z-10 flex items-start justify-between">
        <h3 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#3B9EFF] transition-colors">
          {genre}
        </h3>
        <Icon className="w-4 h-4 text-[#3B9EFF] shrink-0 opacity-80" />
      </div>

      <div className="relative z-10">
        <span className="text-[11px] text-[#A8B0BD]">{count}</span>
      </div>
    </Link>
  );
}
