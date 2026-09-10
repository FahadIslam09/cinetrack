import Link from "next/link";

interface GenreCardProps {
  genre: string;
  vaultLabel?: string;
  vaultColor?: string;
  bgImage?: string;
  href?: string;
  count?: string;
  iconName?: string;
}

export function GenreCard({
  genre,
  vaultLabel = "Vault",
  vaultColor = "text-[#3B9EFF]",
  bgImage,
  href,
}: GenreCardProps) {
  const targetHref = href || `/discover?genre=${encodeURIComponent(genre)}`;

  return (
    <Link
      href={targetHref}
      className="group relative h-28 rounded-xl overflow-hidden bg-[#1D2734] border border-white/[0.06] flex items-end p-3 sm:p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.12] shadow-sm"
    >
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-out"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-[#0F141D]/60 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest block mb-0.5 ${vaultColor}`}
        >
          {vaultLabel}
        </span>
        <h3 className="font-bold text-sm sm:text-base text-[#F5F7FA] tracking-tight uppercase group-hover:text-white transition-colors">
          {genre}
        </h3>
      </div>
    </Link>
  );
}

