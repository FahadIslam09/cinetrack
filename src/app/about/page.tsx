import { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { Footer } from "@/components/navigation/footer";
import { BackButton } from "@/components/ui/back-button";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About · CineTrack",
  description:
    "The story behind CineTrack: why we built a personal place to remember what we watch and share great recommendations.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-[#0F141D] text-[#F5F7FA]">
      <AppHeader
        user={
          user
            ? {
                email: user.email,
                avatarUrl: user.user_metadata?.avatar_url,
                username: user.user_metadata?.user_name,
              }
            : null
        }
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20 md:pb-12">
        <div className="mb-6">
          <BackButton fallbackUrl="/" label="Back" />
        </div>

        {/* Story Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-[#3B9EFF] tracking-wider uppercase mb-5">
          The Origin Story
        </div>

        {/* Main Emotional Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F7FA] leading-[1.2] mb-6">
          It started with a simple question and a completely blank mind.
        </h1>

        {/* The Real Story */}
        <article className="space-y-6 text-sm sm:text-[15px] text-[#A8B0BD] leading-relaxed">
          <p>
            We have all lived this exact moment. A friend, a coworker, or someone
            in your family looks at you and asks:
          </p>

          {/* Relatable Quote Callout */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#151C27] border border-white/[0.06] my-4">
            <p className="text-base sm:text-lg text-[#F5F7FA] font-medium italic leading-snug">
              &ldquo;Hey, can you suggest a good movie or series to watch tonight?&rdquo;
            </p>
          </div>

          <p>
            You know you have watched hundreds of hours of cinema. You have stayed
            up late finishing incredible shows. You have fallen in love with great
            anime arcs. You consider yourself someone who truly appreciates good
            stories.
          </p>

          <p>
            Yet right at that exact second, your brain freezes. You stand there
            awkwardly grasping for a single title, and nothing comes up. Your
            mind is a complete blank. Then, twenty minutes after the
            conversation ends and they have already moved on, three brilliant
            titles pop into your head. Too late.
          </p>

          <p className="text-[#F5F7FA] font-medium pt-2">
            That recurring frustration is the sole reason CineTrack exists.
          </p>

          <p>
            I got tired of forgetting the things that moved me. I wanted a quiet,
            dependable place to write down what I watch as I finish it. Not a
            noisy social media feed stuffed with sponsored ads, and not an ugly,
            tedious spreadsheet that feels like doing taxes. Just an honest,
            personal record of the stories that kept me company.
          </p>

          <p>
            Now, whenever someone asks for a recommendation, I do not have to
            scramble or second-guess myself. I open my library, take a quick
            glance, and share something special right away.
          </p>

          <p>
            The second problem was just as familiar: sitting down at night and
            having no idea what to watch next. You spend forty-five minutes
            aimlessly scrolling through trailers and streaming apps, your dinner
            gets cold, and you end up exhausted before the movie even starts.
            Finding something genuinely good takes way too much time.
          </p>

          <p>
            That is why Discover is built right into this site. Instead of
            algorithmic hype, you can skim honest reviews and thoughts from
            real people who actually sat through the movie. In two minutes,
            you find something solid, hit play, and actually enjoy your evening.
          </p>

          <p>
            Whether you want a reliable memory keeper for your own catalog, or a
            fast way to find your next favorite story without the endless
            scrolling, this place was built for you too.
          </p>
        </article>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-4 text-xs font-medium text-[#A8B0BD]">
          <Link
            href="/discover"
            className="hover:text-white transition-colors flex items-center gap-1 text-[#3B9EFF]"
          >
            <span>Explore what to watch next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
