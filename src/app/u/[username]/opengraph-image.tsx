import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "CineTrack User Profile Card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

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
          padding: "60px 80px",
          color: "#F5F7FA",
          fontFamily: "sans-serif",
          border: "2px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "rgba(59, 158, 255, 0.15)",
                border: "1px solid rgba(59, 158, 255, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                color: "#3B9EFF",
                fontWeight: "bold",
              }}
            >
              ▶
            </div>
            <div style={{ display: "flex", fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
              <span>Cine</span>
              <span style={{ color: "#3B9EFF" }}>Track</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              background: "rgba(59, 158, 255, 0.12)",
              color: "#3B9EFF",
              padding: "8px 18px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            <span>Curator Profile</span>
          </div>
        </div>

        {/* User Bio & Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", fontSize: "48px", fontWeight: "800", letterSpacing: "-1px" }}>
            <span>@{username}</span>
          </div>
          <div style={{ display: "flex", fontSize: "22px", color: "#A8B0BD" }}>
            <span>Tracking movies, series, and anime with personal ratings and reviews.</span>
          </div>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "48px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#3B9EFF" }}>
              142
            </span>
            <span style={{ fontSize: "14px", color: "#6F7886", textTransform: "uppercase" }}>
              Titles Tracked
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#F5C84B" }}>
              8.3 ★
            </span>
            <span style={{ fontSize: "14px", color: "#6F7886", textTransform: "uppercase" }}>
              Mean Score
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#22C55E" }}>
              18d 4h
            </span>
            <span style={{ fontSize: "14px", color: "#6F7886", textTransform: "uppercase" }}>
              Estimated Screen Time
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
