import Link from "next/link";
import { LogoIcon } from "@/components/ui/logo-icon";

export function Footer() {
  return (
    <footer className="w-full bg-[#0F141D] border-t border-white/[0.06] py-6 md:py-8 pb-24 md:pb-8">
      <div className="w-full max-w-[834px] lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F7886]">
        {/* Brand & Copyright */}
        <div className="flex items-center gap-2">
          <LogoIcon className="w-5 h-5" size={20} />
          <span className="font-semibold text-[#F5F7FA]">
            Cine<span className="text-[#3B9EFF]">Track</span>
          </span>
          <span className="text-white/20">•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        {/* Minimal Navigation Links */}
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
