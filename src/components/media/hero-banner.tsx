"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Star,
  Search,
  Share2,
  PlusCircle,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "../quick-add/quick-add-modal";

interface HeroBannerProps {
  user?: {
    username?: string;
    email?: string;
  } | null;
  featuredMedia?: NormalizedMedia | null;
  secondaryMedia?: NormalizedMedia | null;
}

export function HeroBanner({ user, featuredMedia }: HeroBannerProps) {
  const router = useRouter();
  const [mobileSearch, setMobileSearch] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      router.push(`/discover?q=${encodeURIComponent(mobileSearch.trim())}`);
    }
  };

  return (
    <>
      {/* ---------------- MOBILE HERO (< 768px) ---------------- */}
      <div className="md:hidden flex flex-col w-full px-4 pt-3 pb-4 gap-3">
        {/* Mobile Quick Search Bar */}
        <form onSubmit={handleMobileSearch} className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center bg-[#171C25] rounded-lg transition-all focus-within:ring-1 focus-within:ring-[#3B9EFF]">
            <Search className="w-4 h-4 text-[#6F7886] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
              placeholder="Search movies, shows, anime..."
              className="w-full h-11 pl-10 pr-4 bg-transparent text-sm font-normal text-[#F5F7FA] placeholder:text-[#6F7886] focus:outline-none"
            />
          </div>
          <Link
            href="/discover"
            className="h-11 w-11 shrink-0 flex items-center justify-center bg-[#171C25] text-[#A8B0BD] hover:text-[#F5F7FA] rounded-lg active:scale-95 transition-all"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Link>
        </form>

        {/* Mobile Hero Experience Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#171C25] shadow-xl ring-1 ring-white/[0.12] p-4">
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC-0DQP9K7DLZt0ORIK3AMc5uqfd_tpbsA4BnB-z7BM53Mr4owdKrICP3N0J3--L70J4hmW4IZK7oiPI52JSAIV5i8gAEGpK_QCCX6ga1bSRJ_DffxyC4St_DmD1h4uxGFEV0q7AmKb22DaZxF3Fala8PsvhlP5pIy-ChxkTwD_hqU4J3Kuiqbso3u7CXV59T8QcPpAVzCBElDDjpLakF5fmZHbx4t0ExUnc6OOEwYj3o9hjo6XaYW3LLrYLHN9In3Jh7g')`,
              filter: "brightness(0.65) saturate(1.1)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090E17] via-[#090E17]/85 to-[#090E17]/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090E17]/90 via-[#090E17]/70 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#3B9EFF]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#090E17]/80 backdrop-blur-md ring-1 ring-white/[0.12] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#3B9EFF] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1C9FF]">
                YOUR PERSONAL CINEMA JOURNAL
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] leading-[34px] font-bold text-[#F5F7FA] tracking-tight">
                Everything You Watch,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5F7FA] via-[#D3E4FF] to-[#3B9EFF]">
                  In One Place.
                </span>
              </h1>
              <p className="text-sm text-[#A8B0BD] leading-[22px] mt-1 max-w-[90%]">
                Track films, series, and anime. Rate, review, and curate your personal library.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="flex-1 h-11 px-4 bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-sm rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Start Tracking</span>
              </button>
              <Link
                href="/discover"
                className="h-11 px-4 bg-[#252A34]/80 hover:bg-[#343943] backdrop-blur-sm text-[#F5F7FA] font-semibold text-sm rounded-lg active:scale-95 transition-all flex items-center justify-center ring-1 ring-white/[0.06] gap-1.5"
              >
                <Compass className="w-4 h-4 text-[#A8B0BD]" />
                <span>Discover</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[#A8B0BD] text-[11px] font-semibold">
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#090E17]/70 backdrop-blur-sm ring-1 ring-white/[0.06] text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="truncate">IMDb Sync</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#090E17]/70 backdrop-blur-sm ring-1 ring-white/[0.06] text-center">
                <EyeOff className="w-3.5 h-3.5 text-[#EDC145]" />
                <span className="truncate">Spoiler-Safe</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#090E17]/70 backdrop-blur-sm ring-1 ring-white/[0.06] text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A1C9FF]" />
                <span className="truncate">Zero Ads</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- TABLET HERO (768px to 1023px) ---------------- */}
      <div className="hidden md:block lg:hidden w-full max-w-[834px] mx-auto px-4 sm:px-6 py-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#101926] via-[#0D141F] to-[#090E17] border border-white/[0.08] p-6 shadow-2xl">
          {/* Background Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#3B9EFF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Hero Text Content (7 cols) */}
            <div className="md:col-span-7 space-y-4 z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] text-[11px] font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
                YOUR PERSONAL MEDIA LIBRARY
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Everything You Watch, <br className="hidden sm:inline" />
                In One <span className="text-[#3B9EFF]">Place.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#A8B0BD] leading-relaxed max-w-md">
                Track movies, TV shows, and anime. Rate what you watch, write reviews, discover what to watch next, and build your own cinematic profile.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="bg-[#3B9EFF] hover:bg-[#2B8CF0] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-[#3B9EFF]/20 active:scale-95 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Start Tracking</span>
                </button>
                <Link
                  href="/discover"
                  className="bg-[#151C27] hover:bg-[#1C2636] text-slate-200 text-xs font-medium px-4 py-2.5 rounded-lg border border-white/[0.08] flex items-center gap-1.5 transition"
                >
                  <span>Explore Discover</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              </div>

              {/* Feature Checklist Icons */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-[#A8B0BD] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track your library</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-[#F5C84B] text-[#F5C84B]" />
                  <span>Rate &amp; review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#3B9EFF]" />
                  <span>Discover more</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Share your profile</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Cards Composition (5 cols) */}
            <div className="md:col-span-5 relative flex justify-center md:justify-end">
              <div className="relative w-full max-w-[280px] h-[220px]">
                {/* Severance Background Card */}
                <div className="absolute -left-2 top-2 w-[180px] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#0F141D] transform -rotate-3 transition duration-300 hover:rotate-0">
                  <div className="relative h-28">
                    <img
                      alt="Severance"
                      className="w-full h-full object-cover opacity-85"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB39q1hFo5T5EiajLxTRZEUQ8cVZ5YTo5xea7rSd6zeH1LFLUxXV3d2G7NOQcIic6qrCzxwbh1ap-RKpVXWCI4uc3jxdfqJFAxY5iO1fvgB1thGger1o2SiqfxRh4drKMAZ8taHSYn8Q3mdVGl_fc09Hf9ch7DUJiayHrKYOeGuahCFH-KHSQadII2EPEC3TVOMbG4KMBpgI5Z-Iv67b19R7S10e9pdhCaRutFhOJRJLtNAddcQdD7mYg"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/60 text-[9px] px-1.5 py-0.5 rounded font-bold text-white uppercase tracking-wider">
                      TV
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-bold text-white truncate">Severance</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-[#3B9EFF] h-full w-2/5" />
                    </div>
                  </div>
                </div>

                {/* Dune: Part Two Center High-Impact Card */}
                <div className="absolute left-10 top-6 w-[200px] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#0F141D] z-20 transform hover:scale-105 transition duration-300">
                  <div className="relative h-32">
                    <img
                      alt="Dune: Part Two"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-IyiX5reY7XRmrP_sP-QMsDNEadbEIe0Fls9o8dwpFZS98VFuO4GXNCX-wzgaAny8HJqwE31vSl6NARmBYp8INE1L0S1ABMs8qVtfZYm937686ZLrgGBThc45Gy0EDcPop7--dy7FgLY13lh7c6_xDTxKv3T1XBTp2vW6q02FTrn3kRi5Dvh-czuyRMACW0IVNU-yFF_0jXQ_ZN2Cyx5trLkL77A27yrb47rgMpZo4BHA8-MI7robfQ"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#3B9EFF] text-[9px] px-1.5 py-0.5 rounded font-bold text-white uppercase tracking-wider">
                      Movie
                    </span>
                    <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-[#F5C84B] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ 8.8
                    </span>
                  </div>
                  <div className="p-2 bg-[#0F141D]">
                    <p className="text-xs font-bold text-white">Dune: Part Two</p>
                    <p className="text-[10px] text-slate-400">IMAX 70mm Experience</p>
                  </div>
                </div>

                {/* Frieren Compact Accent Badge */}
                <div className="absolute right-0 bottom-1 bg-[#1A2330]/95 backdrop-blur border border-white/[0.08] rounded-lg p-2 shadow-xl z-30 flex items-center gap-2 max-w-[170px]">
                  <img
                    alt="Anime thumbnail"
                    className="w-8 h-8 rounded object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrN8y3IQXwH7iomznKlKdXG9FExjRWrQaz0ECtbcH3Dahxnx44Tv5rta5PIzwZszYEfWryVHUogceONeV_Dn4pOy6g6MEYQz86LhQ1cEVM0ffW_Gmxcs3A0KConxgJsCjTQ_V72R28_7SnAyZnJF66maTa2i-Fz-IYYhr8J7Gghvkz9mVivBNMcLYn3z_BIByoD8fuR2rYo34IpdqK61lrUiffNZXbwlX0Cot1ZLyhB7F_7ju5NGX_wQ"
                  />
                  <div className="overflow-hidden text-[10px]">
                    <p className="font-bold text-white truncate">Frieren</p>
                    <span className="text-[#3B9EFF] font-semibold text-[9px]">EP 18/28</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ---------------- DESKTOP HERO (≥ 1024px) ---------------- */}
      <section className="hidden lg:flex relative w-full min-h-[500px] lg:h-[520px] overflow-hidden bg-[#0F141D] border-b border-white/[0.06] items-center">
        {/* Ambient Marquee Drifting Background Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <style>{`
            @keyframes driftLeft {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            @keyframes driftRight {
              0% { transform: translate3d(-50%, 0, 0); }
              100% { transform: translate3d(0, 0, 0); }
            }
            .hero-row-left {
              display: flex;
              width: max-content;
              animation: driftLeft 65s linear infinite;
              will-change: transform;
            }
            .hero-row-right {
              display: flex;
              width: max-content;
              animation: driftRight 75s linear infinite;
              will-change: transform;
            }
          `}</style>
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-[#3B9EFF]/10 blur-3xl pointer-events-none" />

          {/* Double Drifting Poster Rows with Scrim */}
          <div className="absolute inset-0 opacity-[0.12] overflow-hidden flex flex-col justify-center gap-4 select-none pointer-events-none">
            <div className="hero-row-left gap-4">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDSqBRnV8-9LRegaKyhdZ1N3PiYLHhWfCHX4Q5pwQwBEfXq64CnpwTkSuxi6OxSGsG3Hj6x37fs010_AZ1Pp4RwQB_OaWLw27RbWAdDqmVj0xoOUzhyCsjTQF63blpPGK2ZaFT3L0Urapfk-jSOImaGagwkBNZTuYW69Z0JBy2Pforrrab7pjFN9RsDwMTVjMrAW9F7Sm-smoZ6i39ebGkFU4iMMjlRm2F0grsaEqWVmZ6mYjBsZ1TGdw",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCd3ylkKZ6v2G1WOqf3bMhdQvvLu8qfLn-DBpvCm6SBL-8xDGjm7Kio7BBIKLctYbUgQlM8SY3yPBv_lcFfGIZdx7v-ZWnu0B-EKthVISOJEEGD-XiINwNp9xQogyKIBjnXqp2wPoC8NNsOPshowraGbuYvkj6aZBed4EtdK5JihufzjIPScDTGVUmjBr1wNiTW_D-EwGbLO7zge5H7ijI2W6KvfJY5hI3vV1WeumcX3S2CGvhBOE1OvA",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuByWzN4ZVcF14AX9OAOeWLSR_0U6h7va2g7dQgp2SugeAHrrZ9OKX3k9lnsGu0nbYXRnrSamQFHCV2_lTKuXWgBqs_xAG99j9ESRVB_5x2RgGaRvvGoIFWiElVeZ7AbKZvKDqmDg7l3orpetXHqFxJ5S1sdfoaLkwzTY-bvzneY7oo7TD7mo-SZE3sP4KUfTh40usmuPDdoQ9ZphTZKuoUjnAZBPKiAfNf5XFxjz6RPh4U2JvEEoNsdcw",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDONO2gGHTvWuimqprUqoDadhSR0SABqh9soGQ5d9ZtxhVxEcfxwNhi_GGDPkRMro_kd9amm_dEGYbVPlXkDEhV_1HI8p0rBChFB18KGO_sJkCK-iwPoxhAvo6YFqrwN8cAnMrab-z-XLzmFL0zDTP4T4YobWnde_WSx9aQUtRl1pU78yXSLrBR8NmwaE0121iafK5x0E_tdYM2-iKcXJ9AC-eyLWTY-_Albh1HjGXWUKxKrVxSUmO88Q",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAhQBAw1f_DaFntt5vuJ6wOzfm4fjYTauWwHZA5eCPHvnpX7MhmUaVKQImFSw8NkzEQWtPbxLGi4ymcrd5KkfadAT18zmr_wrMz0BKfOWlAnDQw0gg4ApFjs7dMtCenA6HIP3pmOYZkhvqjp8_BuMXb254II6eUxukGeZ4NA8jLs_EPd1uyD4Cdg9YNUpynw_JpF4Q03A6v5oEE3W_WQp9KixvQBzDPzrTt36HOkQse5uZH6JmWpGgNVQ",
              ].map((src, idx) => (
                <img
                  key={`left-${idx}`}
                  src={src}
                  alt="Poster"
                  className="w-36 h-52 object-cover rounded-lg shrink-0"
                />
              ))}
            </div>
            <div className="hero-row-right gap-4">
              {[
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDWgUXIjTeZX_aRC94tlJk2XXajZtRvSXTTx9i1938P1cO9yEhp5pm9cGdBFF6BYdars2YhlAlKzGHYS55MTi7oABGyyJpyQUJF9_EfnnpOgBv9x5rzZuxAE_UxfmDroCd90llxWZalZ0UjqrQovcutUSxmJKi8d5vWc-u6pVE1o6dzo3SIACZuLtnlUflAtFplfAjOYGwNEnaP-qhpZZCrorBtPSm_oc1rh5KjRzKpc_hKigV7QxSIdg",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDicxBq7GfGq41dbGEnOW-hGYhuNE312k1Ouz976F9ggZ_rFz3ogL0kwN1r2Seukwjan1bKpvJwHlcnJvZU6a39qWNG6STi-Eg2obclQfv6wQzSvYQZg2KLUgQiavXfEroMtvIJYWbqmKQXOgHhfFIuCCs-IfvbBblML1k1WG79cd4rDCDw66linnnO5KV3QmvB-Y7PZW2xUBadQrSrUCgKzz8cgDMnl2WLuW48SUyo_ukoi7J2pcWCIw",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDd_CGwuaNuJJZu_t2mD6ShdRsubg74KoaxCmMgnjiM-CITBBXzYyjjrixqdVTl4fJeioz9eyKj39L5LMheCbeI1qexLT9UAtpAG6AwK11XAm-SZjp0ivV0B2p8JpryUVLXTA00XiN5tai-CTlG-yqek6GoprQsJPF_HxL6acQNm4oX6F5jQj92qC4hAJFXjyY7_BV3d7HobInB6hpgLppNAKgK8ZAZiA-XkTHd5b0Vk4PeACG-vuoixg",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBWSx1iQY3LdBM28IQz8NYuK5swpSumAcLj3ppG-e207-B8txw0Iu-mBqpbkStZBCLW-QzX58vyQGse3ZQrHBuOYF8biYX_VlZ9kGIbqOS54M-ntU9s7LBOIAgMAaevu7cniIvxCbs_c8cnVdR7KoO9ne51Bb8gxNb7bAAdSRUrY45Etv4yctEvtNjjyENNCIpQHtCNiCUdgoH-y4a8RnUHSLAFMk_WSdbFArNkkl7ZTO7MhgAHioV6w",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuClt97IAonD8Y4vNI2in9CiBMQJ0U_I9iPs4YwjdXIgZDFtywtTsDCDMsuM7cKxOyG99MfmWy5_d-FkC9_9js4SPWxs7gZoUVRBkaSh3jiIOAjo5N1uDekXznbcVMGFHTtUUgIeAKMbE8HGR3S42Rp8R9DKptWoqdKR4L2jSnr_9Tg6U0pxKOERFtMUglFGU-fgwi4hoeqjMFTgM6Mh14nZsXg_lW9UuqvXBo2Z5ptmT3g0kFUtgKdN6Q",
              ].map((src, idx) => (
                <img
                  key={`right-${idx}`}
                  src={src}
                  alt="Poster"
                  className="w-36 h-52 object-cover rounded-lg shrink-0"
                />
              ))}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-[#0F141D] via-[#0F141D]/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-transparent z-10" />
        </div>

        {/* Hero Main Content */}
        <div className="relative z-20 max-w-[1440px] mx-auto w-full px-6 sm:px-8 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D2734] border border-white/[0.06] text-[#3B9EFF] text-[11px] font-bold uppercase tracking-widest mb-3.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
              YOUR PERSONAL MEDIA LIBRARY
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#F5F7FA] tracking-tight mb-2 leading-[1.15]">
              Everything You Watch, <br className="hidden sm:inline" />
              In One <span className="text-[#3B9EFF]">Place.</span>
            </h1>

            <p className="text-sm sm:text-[15px] text-[#A8B0BD] max-w-xl mb-6 leading-relaxed">
              Track movies, TV shows, and anime. Rate what you watch, write reviews, discover what to watch next, and build your own cinematic profile.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="h-10 px-5 rounded-lg bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors shadow-lg shadow-[#3B9EFF]/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Tracking</span>
              </button>
              <Link
                href="/discover"
                className="h-10 px-5 rounded-lg bg-[#1A2330] hover:bg-[#253244] text-[#F5F7FA] border border-white/[0.08] hover:border-white/[0.16] font-semibold text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>Explore Discover</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4-Feature Trust Checklist Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#A8B0BD] text-xs border-t border-white/[0.06] pt-3.5 font-medium">
              <div className="flex items-center gap-1.5 text-[#F5F7FA]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Track your library</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Star className="w-3.5 h-3.5 fill-[#F5C84B] text-[#F5C84B]" />
                <span>Rate &amp; review</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Search className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Discover more</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F5F7FA]">
                <Share2 className="w-3.5 h-3.5 text-[#FFB873]" />
                <span>Share your profile</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Fanned Poster Presentation */}
          <div className="lg:col-span-5 relative flex items-center justify-center h-[380px] lg:h-[420px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Left Card: Severance (-6 deg tilt) */}
              <div className="absolute left-2 sm:left-4 top-8 w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#1D2734] transform -rotate-6 hover:rotate-0 transition-transform duration-300 z-10 group cursor-pointer">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdCoBJ2wHL6FF6zdhqM6G75DoyQtw7WerBsV7fkYLrrmITySnc14C5SY2VBaLaH_GZtNuvkqz9F3Ptsvq18XP-M0mpPkAt7iQB9jEzeL1V3zST1jt527dUBpGr9Lu3DC-nE4h09ssDf8b0eRe1h22GlGmPKABFaHAuZLNTxauh4qBwgXrSeIJatfk0iT-ohQOmRD2xSZPxzkZPAFRKCddwddKwUX6p5i1PpyO6suuJtJ6LZF_PNyfFqQ"
                  alt="Severance poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0F141D]/90 backdrop-blur text-[10px] font-bold text-[#3B9EFF] uppercase">
                  TV
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#0F141D]/90 text-[#F5C84B] font-bold text-xs flex items-center gap-0.5">
                  ★ 8.7
                </div>
              </div>

              {/* Right Card: Frieren (+6 deg tilt) */}
              <div className="absolute right-2 sm:right-4 bottom-4 w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-[#1D2734] transform rotate-6 hover:rotate-0 transition-transform duration-300 z-10 group cursor-pointer">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJPtAZ2htS5a-Ux_Eu58pt3uMwAtQu5NBtYjPh95_2qpJNuSvHq6v_tpOQcGZB-Pr_DL89Z17J1S8HKHR1mDly_G8vWjBIISoL7OmPx1aa8qTsMZKkWOc3h4JhZSeTWhw9Gc3zhMLqG6HhOlMrCWox8fmL0IDzOeaqfVMwxbItVFTwykyqR6I_2QRKOl6j7HFxetZV25-QARKGR742HCRi4unAqIgv3XCib1iaTALuLLybLNdDM-_hzQ"
                  alt="Frieren anime poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0F141D]/90 backdrop-blur text-[10px] font-bold text-[#A1C9FF] uppercase">
                  ANIME
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-[#0F141D]/90 text-[#22C55E] text-[10px] font-bold uppercase">
                  Ep 18/28
                </div>
              </div>

              {/* Center Foreground Card: Dune Part Two */}
              <div className="relative w-40 sm:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-[#3B9EFF]/40 bg-[#1D2734] z-20 transform hover:scale-105 transition-transform duration-300 group cursor-pointer">
                <img
                  src={
                    featuredMedia?.posterPath ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDonCMWwdS2HcypQ7q784N4rllW1Kp6Tx9untnXYhwir2VEeE5-znx85yr8fJDNHykP3iGGBAlJHtM_WeiyDKDQAgJNFhwRcrhTMZzVmGfAod4Kt8kzcg5Jzovah0zDijCHx-4_Tyl7_y4KPbm-qW_TFA_9rPVjUEslFLDF6OyTCZNrJqgl_o3Qv40WmEh6_iQZz3UZaaheqLD3b0eaVE41HuCeR-U-S4ewaO0uH3284n2MkLpoLCZ2fw"
                  }
                  alt="Dune Part Two poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141D] via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-[#3B9EFF] text-white text-[10px] font-bold uppercase tracking-wider">
                  MOVIE
                </div>
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-[#F5F7FA]">
                  <span className="font-semibold text-xs sm:text-sm truncate">
                    {featuredMedia?.title || "Dune: Part Two"}
                  </span>
                  <span className="text-[#F5C84B] font-bold text-xs flex items-center gap-0.5 shrink-0">
                    ★ 8.8
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        media={{
          id: "tmdb:movie:693134",
          source: "tmdb",
          sourceId: "693134",
          mediaType: "movie",
          title: "Dune: Part Two",
          year: "2024",
          rating: 8.8,
          totalEpisodes: 1,
          posterPath:
            "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
          backdropPath:
            "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
          genres: ["Sci-Fi", "Adventure"],
          synopsis:
            "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        }}
      />
    </>
  );
}
