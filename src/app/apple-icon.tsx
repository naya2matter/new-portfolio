import { ImageResponse } from "next/og";

// Home-screen icon for iOS, which ignores SVG icons — the same monogram as
// icon.svg, rendered to PNG on a full ivory tile (iOS rounds the corners).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff9e2",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18.25" stroke="#dca278" strokeWidth="1.5" />
          <path
            d="M13.5 27.5V12.5M26.5 27.5V12.5"
            stroke="#232a1e"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M13.5 12.5L26.5 27.5" stroke="#dca278" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="30.5" cy="11.5" r="2" fill="#dca278" />
        </svg>
      </div>
    ),
    size,
  );
}
