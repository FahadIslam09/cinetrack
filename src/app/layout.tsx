import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { BackToTop } from "@/components/ui/back-to-top";
import { ProfileSetupProvider } from "@/components/profile/profile-setup-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cinetrack.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  referrer: "origin-when-cross-origin",
  title: {
    default: "CineTrack · Everything You Watch, In One Place",
    template: "%s · CineTrack",
  },
  description:
    "A fast, minimal, worldwide social tracking platform to discover, track, rate, review, and share movies, TV series, and anime.",
  keywords: [
    "movie tracker",
    "tv series tracker",
    "anime tracker",
    "watchlist app",
    "cinetrack",
    "letterboxd alternative",
    "film reviews",
    "track cinema",
  ],
  authors: [{ name: "CineTrack" }],
  creator: "CineTrack",
  publisher: "CineTrack",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "CineTrack",
    title: "CineTrack · Everything You Watch, In One Place",
    description:
      "A fast, minimal, worldwide social tracking platform to discover, track, rate, review, and share movies, TV series, and anime.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineTrack · Everything You Watch, In One Place",
    description:
      "A fast, minimal, worldwide social tracking platform to discover, track, rate, review, and share movies, TV series, and anime.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0F141D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansBengali.variable} dark`} suppressHydrationWarning>
      <body className="bg-[#0F141D] text-[#F5F7FA] min-h-screen flex flex-col antialiased selection:bg-[#3B9EFF]/30" suppressHydrationWarning>
        <SmoothScrollProvider>
          {children}
          <BackToTop />
          <ProfileSetupProvider />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
