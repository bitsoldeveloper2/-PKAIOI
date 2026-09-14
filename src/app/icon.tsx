import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f6e56", borderRadius: 16 }}>
        <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
          <path
            d="M39 18.5c-7.5 0-13.5 6-13.5 13.5S31.5 45.5 39 45.5c2.4 0 4.6-.6 6.5-1.7C42.7 47.9 38 50.5 32.7 50.5 22.5 50.5 14.2 42.2 14.2 32S22.5 13.5 32.7 13.5c5.3 0 10 2.6 12.8 6.7-1.9-1.1-4.1-1.7-6.5-1.7z"
            fill="#f4fbf8"
          />
          <circle cx="44.5" cy="24" r="2.6" fill="#f4fbf8" />
          <circle cx="49" cy="32" r="2.6" fill="#f4fbf8" />
          <circle cx="44.5" cy="40" r="2.6" fill="#f4fbf8" />
        </svg>
      </div>
    ),
    size,
  );
}
