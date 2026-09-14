import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Pakistan Institute of AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(160deg, #0c1a17 0%, #123d33 100%)",
          color: "#eeeae2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#3db48c" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, letterSpacing: -0.5 }}>PIOAI</span>
            <span style={{ fontSize: 14, letterSpacing: 4, textTransform: "uppercase", opacity: 0.6, fontFamily: "sans-serif" }}>Pakistan Institute of AI</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 18, fontSize: 76, lineHeight: 1, letterSpacing: -2, maxWidth: 900 }}>
            <span>An institution for the</span>
            <span style={{ color: "#8fd7bb", fontStyle: "italic" }}>age of intelligence.</span>
          </div>
          <div style={{ fontSize: 26, opacity: 0.75, fontFamily: "sans-serif", maxWidth: 820 }}>{`${siteConfig.tagline} Rigorous programs, applied research, an AI-native campus.`}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, opacity: 0.55, fontFamily: "sans-serif" }}>
          <span>Lahore · Karachi · Islamabad · Online</span>
          <span>pioai.edu.pk</span>
        </div>
      </div>
    ),
    size,
  );
}
