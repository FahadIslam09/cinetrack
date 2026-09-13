import Link from "next/link";
import { LogoIcon } from "@/components/ui/logo-icon";
import { Lightbulb, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#0F141D] border-t border-white/[0.06] py-6 md:py-8 pb-24 md:pb-8">
      <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#6F7886]">
        {/* Brand, Copyright & Developer Signature */}
        <div className="flex items-center gap-2 flex-wrap">
          <LogoIcon className="w-5 h-5" size={20} />
          <span className="font-semibold text-[#F5F7FA]">
            Cine<span className="text-[#3B9EFF]">Track</span>
          </span>
          <span className="text-white/20">•</span>
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-white/20">•</span>
          <span className="text-[#6F7886]">Built by</span>
          <a
            href="https://fahadislam.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-[#CBD5E1] hover:text-[#3B9EFF] transition-colors group"
          >
            <span>Fahad Islam</span>
            <ArrowUpRight className="w-3 h-3 text-[#3B9EFF] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {/* Highlighted Feature Request Link (Separated to catch eyes) */}
        <div className="flex items-center">
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3B9EFF]/10 hover:bg-[#3B9EFF]/20 border border-[#3B9EFF]/30 hover:border-[#3B9EFF]/60 text-[#3B9EFF] hover:text-[#5AAFFF] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(59,158,255,0.15)] cursor-pointer group"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#3B9EFF] group-hover:scale-110 transition-transform" />
            <span>Need a New Feature? Request Here</span>
          </Link>
        </div>

        {/* Minimal Secondary Navigation Links */}
        <nav
          className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center"
          aria-label="Footer Navigation"
        >
          <Link href="/about" className="hover:text-[#F5F7FA] transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-[#F5F7FA] transition-colors">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-[#F5F7FA] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[#F5F7FA] transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
