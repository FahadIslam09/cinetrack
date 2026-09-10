import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#0F141D] border-t border-white/[0.06] pt-10 pb-24 sm:py-12 mt-8">
      <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-[#3B9EFF] to-blue-700 flex items-center justify-center text-white text-xs shadow-md">
                <Film className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base text-[#F5F7FA]">
                Cine<span className="text-[#3B9EFF]">Track</span>
              </span>
            </div>
            <p className="text-xs text-[#6F7886] leading-relaxed">
              Disciplined personal cataloging and editorial film intelligence. Track, rate, and discover with surgical precision.
            </p>
          </div>

          {/* Col 2: Explore Media */}
          <div>
            <h4 className="text-[11px] font-bold uppercase text-[#6F7886] mb-3 tracking-wider">
              Explore Media
            </h4>
            <ul className="space-y-2 text-xs text-[#A8B0BD]">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?type=movie"
                >
                  Trending Feature Films
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?type=series"
                >
                  Primetime TV Series
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?type=anime"
                >
                  Seasonal Anime Simulcasts
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover"
                >
                  Editorial Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Genres */}
          <div>
            <h4 className="text-[11px] font-bold uppercase text-[#6F7886] mb-3 tracking-wider">
              Popular Genres
            </h4>
            <ul className="space-y-2 text-xs text-[#A8B0BD]">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?genre=Thriller"
                >
                  Psychological Thriller
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?genre=Noir"
                >
                  Neo-Noir &amp; Crime
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?genre=Sci-Fi"
                >
                  Cyberpunk &amp; Sci-Fi
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/discover?genre=Drama"
                >
                  Arthouse &amp; International
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Data Attribution */}
          <div>
            <h4 className="text-[11px] font-bold uppercase text-[#6F7886] mb-3 tracking-wider">
              Data Attribution
            </h4>
            <p className="text-xs text-[#6F7886] leading-relaxed">
              Metadata and artwork sourced via verified open entertainment APIs. Powered by independent community contributions and editorial critics.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[#22C55E] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span>API Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6F7886]">
          <div>© {new Date().getFullYear()} CineTrack Platform. All rights reserved.</div>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <span>API v2.4 Editorial Core</span>
            <Link href="/discover" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/discover" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
