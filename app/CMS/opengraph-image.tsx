// app/CMS/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OGImage() {
  return new ImageResponse(
    (
      <img
        src="https://schedual-five.vercel.app/images/cms.png"
        alt="CMS Preview"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
