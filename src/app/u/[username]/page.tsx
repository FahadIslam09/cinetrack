import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Share2,
  CheckCircle2,
  MapPin,
  Clock,
  Film,
  Tv,
  Sparkles,
  ChevronRight,
  Heart,
  Plus,
} from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { ReviewCard } from "@/components/reviews/review-card";
import { db } from "@/lib/db";
import { profiles, userMediaLogs, mediaItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  let profile: any = null;
  let logs: any[] = [];

  try {
    const [foundProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username.toLowerCase()))
      .limit(1);

    profile = foundProfile;

    if (profile) {
      logs = await db
        .select({
          log: userMediaLogs,
          media: mediaItems,
        })
        .from(userMediaLogs)
        .innerJoin(mediaItems, eq(userMediaLogs.mediaId, mediaItems.id))
        .where(eq(userMediaLogs.userId, profile.id))
        .orderBy(desc(userMediaLogs.updatedAt));
    }
  } catch (err) {
    console.error("Profile fetch error:", err);
  }

  // Fallback demo data matching the Elena Vance mockup if profile is new or guest
  const isDemo = !profile;
  const user = profile || {
    username: username || "elenavance",
    fullName: "Elena Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
    bio: "Film archivist & sci-fi enthusiast. Contributor at Sight & Sound. Focused on post-Soviet speculative fiction and structuralist narratives.",
    preferredCountry: "Berlin, Germany",
  };

  const stats = {
    logged: logs.length > 0 ? logs.length : 142,
    films: logs.filter((l) => l.media.mediaType === "movie").length || 86,
    series: logs.filter((l) => l.media.mediaType === "series").length || 38,
    anime: logs.filter((l) => l.media.mediaType === "anime").length || 18,
  };

  const tasteBreakdown = {
    masterpiece:
      logs.filter((l) => l.log.rating === "masterpiece").length ||
      (isDemo ? 34 : 0),
    good:
      logs.filter((l) => l.log.rating === "good").length ||
      (isDemo ? 68 : 0),
    average:
      logs.filter((l) => l.log.rating === "average").length ||
      (isDemo ? 28 : 0),
    poor:
      logs.filter((l) => l.log.rating === "poor").length ||
      (isDemo ? 12 : 0),
  };

  // Curator's Quadrant (Top 4 Favorites)
  const curatorQuadrant = [
    {
      title: "Blade Runner 2049",
      year: "2017 • Denis Villeneuve",
      rating: "masterpiece" as const,
      quote: "“Visual brutalism paired with melancholic human inquiry.”",
      poster: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    },
    {
      title: "Stalker",
      year: "1979 • Andrei Tarkovsky",
      rating: "masterpiece" as const,
      quote: "“The purest translation of existential faith into kinetic rhythm.”",
      poster: "https://image.tmdb.org/t/p/w500/lUEy6h5Cq18bKqS9eS8qS6v6pW4.jpg",
    },
    {
      title: "Arrival",
      year: "2016 • Denis Villeneuve",
      rating: "masterpiece" as const,
      quote: "“Linguistic determinism as a profound vessel for grief.”",
      poster: "https://image.tmdb.org/t/p/w500/x2O0hvQcbIRgUuYg8sE4LgKj9N2.jpg",
    },
    {
      title: "Perfect Blue",
      year: "1997 • Satoshi Kon",
      rating: "masterpiece" as const,
      quote: "“Dizzying match-cuts deconstructing early internet voyeurism.”",
      poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx437-GviWlU9bN4yP.jpg",
    },
  ];

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] pb-24 md:pb-12">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-20 flex flex-col gap-5">
        {/* Profile Header Card */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl bg-[#151C27] border border-white/[0.06] shadow-sm">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar with Verified check */}
            <div className="relative shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-white/10 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-[#3B9EFF] text-white shadow">
                <CheckCircle2 className="w-4 h-4 fill-white text-[#3B9EFF]" />
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-extrabold text-xl sm:text-2xl text-[#F5F7FA]">
                {user.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#3B9EFF]/20 text-[#3B9EFF]">
                PRO CRITIC • VERIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#A8B0BD]">
              <span>@{user.username}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.preferredCountry || "Worldwide"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#dee2ef] leading-relaxed mt-2">
              {user.bio}
            </p>

            {/* Hashtags */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              {["#35mmFilmPreservation", "#CyberpunkAesthetics", "#TarkovskyAcolyte"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-[#1D2734] text-[11px] font-medium text-[#A8B0BD] border border-white/[0.04]"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.06] text-center">
            <div>
              <span className="block font-extrabold text-base sm:text-lg text-[#F5F7FA]">
                {stats.logged}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886]">
                Logged
              </span>
            </div>
            <div>
              <span className="block font-extrabold text-base sm:text-lg text-[#F5F7FA]">
                {stats.films}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886]">
                Films
              </span>
            </div>
            <div>
              <span className="block font-extrabold text-base sm:text-lg text-[#F5F7FA]">
                {stats.series}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886]">
                Series
              </span>
            </div>
            <div>
              <span className="block font-extrabold text-base sm:text-lg text-[#F5F7FA]">
                {stats.anime}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F7886]">
                Anime
              </span>
            </div>
          </div>

          {/* Taste Profile Distribution */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#1D2734] border border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#F5F7FA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5C84B]" />
                <span>Taste Profile</span>
              </span>
              <span className="text-[10px] text-[#6F7886] font-semibold uppercase tracking-wider">
                Personal Ratings
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-[#F5C84B]/10 border border-[#F5C84B]/20">
                <span className="block text-sm sm:text-base font-extrabold text-[#F5C84B] leading-none">
                  {tasteBreakdown.masterpiece}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F5C84B]/90 mt-1 block">
                  Masterpieces
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#3B9EFF]/10 border border-[#3B9EFF]/20">
                <span className="block text-sm sm:text-base font-extrabold text-[#3B9EFF] leading-none">
                  {tasteBreakdown.good}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#3B9EFF]/90 mt-1 block">
                  Good
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <span className="block text-sm sm:text-base font-extrabold text-[#F59E0B] leading-none">
                  {tasteBreakdown.average}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]/90 mt-1 block">
                  Average
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/20">
                <span className="block text-sm sm:text-base font-extrabold text-[#F43F5E] leading-none">
                  {tasteBreakdown.poor}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#F43F5E]/90 mt-1 block">
                  Poor
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button className="px-3 py-1.5 rounded-lg bg-[#3B9EFF] text-white">
            Overview
          </button>
          <button className="px-3 py-1.5 text-[#A8B0BD] hover:text-white transition-colors">
            Favorites (4)
          </button>
          <button className="px-3 py-1.5 text-[#A8B0BD] hover:text-white transition-colors">
            Recent Logs
          </button>
          <button className="px-3 py-1.5 text-[#A8B0BD] hover:text-white transition-colors">
            Reviews (28)
          </button>
        </div>

        {/* Curator's Quadrant (Permanent 4) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F5C84B] fill-[#F5C84B]" />
              <h2 className="font-bold text-base text-[#F5F7FA]">Curator&apos;s Quadrant</h2>
            </div>
            <span className="text-[11px] font-bold text-[#A8B0BD] uppercase tracking-wider">
              PERMANENT 4
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {curatorQuadrant.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-xl overflow-hidden bg-[#151C27] border border-white/[0.06] shadow-sm group"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1D2734]">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-[#0F141D]/90 backdrop-blur-sm text-[#F5C84B] text-[10px] font-bold border border-[#F5C84B]/30 uppercase tracking-wider">
                    Masterpiece
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <h3 className="font-bold text-xs text-[#F5F7FA] truncate">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-[#A8B0BD] truncate">
                    {item.year}
                  </span>
                  <p className="text-[11px] text-[#dee2ef] italic line-clamp-2 mt-1 leading-snug">
                    {item.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Rotations (In Progress) */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[#F5F7FA]">Active Rotations</h2>
            <span className="text-[11px] text-[#A8B0BD]">2 IN PROGRESS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <img
                src="https://image.tmdb.org/t/p/w185/7q41C2Z5iQzF5iM7B3zQk8c8Q7r.jpg"
                alt="Severance"
                className="w-12 h-16 rounded-lg object-cover bg-[#1D2734]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#F5F7FA] truncate">Severance</h4>
                <p className="text-xs text-[#A8B0BD]">Season 2 • Apple TV+</p>
                <div className="flex items-center justify-between text-[11px] text-[#3B9EFF] font-semibold mt-2">
                  <span>Ep 7/10</span>
                  <span>70%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="w-[70%] h-full bg-[#3B9EFF]" />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center gap-3">
              <img
                src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx136430-b3k09n8yL0b6.jpg"
                alt="Vinland Saga"
                className="w-12 h-16 rounded-lg object-cover bg-[#1D2734]"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-[#F5F7FA] truncate">Vinland Saga</h4>
                <p className="text-xs text-[#A8B0BD]">Season 2 • MAPPA</p>
                <div className="flex items-center justify-between text-[11px] text-[#3B9EFF] font-semibold mt-2">
                  <span>Ep 22/24</span>
                  <span>91%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="w-[91%] h-full bg-[#3B9EFF]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Dispatches */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[#F5F7FA]">Recent Dispatches</h2>
            <span className="text-[11px] font-bold text-[#3B9EFF] uppercase tracking-wider">
              EDITORIAL NOTES
            </span>
          </div>

          <div className="space-y-3">
            <ReviewCard
              author={{
                name: user.fullName,
                avatarUrl: user.avatarUrl,
                isVerified: true,
              }}
              mediaTitle="Dune: Part Two"
              rating="masterpiece"
              reviewText="Villeneuve achieves an astonishing sensory convergence of religious fervor and sonic weaponization. Greig Fraser's infrared cinematography during the Giedi Prime gladiatorial sequence creates an almost alien physical presence rarely allowed in high-budget cinema."
              likesCount={184}
              commentsCount={32}
              timeAgo="Yesterday"
            />

            <ReviewCard
              author={{
                name: user.fullName,
                avatarUrl: user.avatarUrl,
                isVerified: true,
              }}
              mediaTitle="Severance — 'The Cold Harbor'"
              rating="masterpiece"
              containsSpoilers={true}
              reviewText="The season finale ties the severed floor dialectic directly to corporate religious worship. The execution of the elevator descent sequence is unmatched in contemporary prestige television."
              likesCount={96}
              commentsCount={14}
              timeAgo="3 days ago"
            />
          </div>
        </section>

        {/* Curated Compendiums */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-[#F5F7FA]">Curated Compendiums</h2>
            <span className="text-xs text-[#3B9EFF] font-semibold">VIEW ALL (6)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center justify-between group cursor-pointer hover:border-[#3B9EFF] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1D2734] overflow-hidden flex items-center justify-center">
                  <Film className="w-6 h-6 text-[#6F7886]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#3B9EFF] transition-colors">
                    Monolithic &amp; Brutalist Sci-Fi
                  </h4>
                  <p className="text-xs text-[#A8B0BD] flex items-center gap-2 mt-0.5">
                    <span>24 titles</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#F43F5E]">
                      <Heart className="w-3 h-3 fill-current" /> 1.4k
                    </span>
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8B0BD]" />
            </div>

            <div className="p-3.5 rounded-xl bg-[#151C27] border border-white/[0.06] flex items-center justify-between group cursor-pointer hover:border-[#3B9EFF] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1D2734] overflow-hidden flex items-center justify-center">
                  <Film className="w-6 h-6 text-[#6F7886]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#F5F7FA] group-hover:text-[#3B9EFF] transition-colors">
                    Bengali Parallel Cinema
                  </h4>
                  <p className="text-xs text-[#A8B0BD] flex items-center gap-2 mt-0.5">
                    <span>19 titles</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#F43F5E]">
                      <Heart className="w-3 h-3 fill-current" /> 892
                    </span>
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A8B0BD]" />
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
