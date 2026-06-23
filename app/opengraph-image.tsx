import { ImageResponse } from "next/og";

import { siteDescription, siteName } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 64,
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%), linear-gradient(135deg, #09090b 0%, #111827 55%, #7f1d1d 100%)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <div
            style={{
              width: 74,
              height: 74,
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 1.5,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            VS
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, letterSpacing: 8, textTransform: "uppercase", opacity: 0.8 }}>
              {siteName}
            </div>
            <div style={{ fontSize: 15, letterSpacing: 4, textTransform: "uppercase", opacity: 0.72, marginTop: 8 }}>
              Coastal editorial archive
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 74, lineHeight: 1.02, fontWeight: 700, letterSpacing: -2 }}>
            Stories from Virac, beautifully shared.
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, maxWidth: 820, color: "rgba(255,255,255,0.88)" }}>
            {siteDescription}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 18, opacity: 0.86 }}>
            <span>Virac, Catanduanes</span>
            <span>Print and digital narratives</span>
          </div>
          <div style={{ fontSize: 18, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7 }}>
            viracspecial.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
