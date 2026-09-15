import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CineTrack · Everything You Watch, In One Place";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F141D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          color: "#F5F7FA",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient Top-Right Radial Glow */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(59, 158, 255, 0.22) 0%, rgba(15, 20, 29, 0) 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Ambient Bottom-Left Subtle Glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(15, 20, 29, 0) 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Top Header: Brand & Live Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #3B9EFF 0%, #1D4ED8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                color: "#FFFFFF",
                fontWeight: "900",
                boxShadow: "0 10px 25px rgba(59, 158, 255, 0.4)",
              }}
            >
              ▶
            </div>
            <div style={{ display: "flex", fontSize: "36px", fontWeight: "800", letterSpacing: "-1px" }}>
              <span>Cine</span>
              <span style={{ color: "#3B9EFF" }}>Track</span>
            </div>
          </div>

          {/* Tagline pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              color: "#A8B0BD",
              fontWeight: "600",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22C55E",
              }}
            />
            <span>cinetrack.xyz</span>
          </div>
        </div>

        {/* Center: Main Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "980px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "64px",
              fontWeight: "900",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              color: "#FFFFFF",
            }}
          >
            <span>Everything You Watch,</span>
            <span style={{ color: "#3B9EFF" }}>In One Place.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#94A3B8",
              lineHeight: 1.4,
              fontWeight: "400",
              maxWidth: "840px",
            }}
          >
            <span>The fastest, modern personal vault to discover, track, rate, review, and share movies, TV series, and anime.</span>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {["🎬 Feature Films", "📺 TV Series", "⚔️ Anime", "⭐ Consensus Ratings", "👥 Friend Activity"].map((badge) => (
            <div
              key={badge}
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "15px",
                color: "#CBD5E1",
                fontWeight: "600",
              }}
            >
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
