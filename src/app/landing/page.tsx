import { LandingView } from "@/components/landing/landing-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CineTrack — Everything You Watch, In One Place",
  description:
    "The universal tracker for movies, TV series, and anime. Track watch history, pull up instant friend recommendations, and share your profile.",
};

export default function LandingPage() {
  return <LandingView />;
}
