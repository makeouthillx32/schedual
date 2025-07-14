// app/Tools/[tool]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default function OGImage({ params }: { params: { tool: string } }) {
  // Map tool name to image filename
  const getImagePath = (toolName: string) => {
    return `https://schedual-five.vercel.app/images/tools/${toolName}.png`;
  };

  return new ImageResponse(
    (
      <img
        src={getImagePath(params.tool)}
        alt={`${params.tool} Preview`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}