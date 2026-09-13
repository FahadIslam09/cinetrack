import { createClient } from "@/lib/supabase/server";
import { RedesignedHomeView } from "@/components/home/redesigned-home-view";
import { PreviousHomeView } from "@/components/home/previous-home-view";
import { LandingView } from "@/components/landing/landing-view";

export const revalidate = 1800; // 30 mins ISR

interface HomePageProps {
  searchParams?: Promise<{ legacy?: string; feed?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Preserved for future reuse: allow previewing previous implementation via ?legacy=true
  if (sp.legacy === "true") {
    return <PreviousHomeView searchParams={searchParams} />;
  }

  // Unauthenticated visitors see the public Landing page
  if (!user) {
    return <LandingView />;
  }

  // Authenticated users see the Home page
  return (
    <RedesignedHomeView
      user={{
        email: user.email,
        avatarUrl: user.user_metadata?.avatar_url,
        username: user.user_metadata?.user_name,
      }}
    />
  );
}
