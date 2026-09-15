import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingView } from "@/components/landing/landing-view";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CineTrack · Track Movies, TV Shows & Anime",
  description:
    "The modern cinematic tracking platform. Keep track of what you watch, share recommendations, and curate your personal film journey.",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/library");
  }

  return <LandingView />;
}

