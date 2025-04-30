import type { Metadata } from "next"
import { getThemeColors } from "@/utils/theme-color"

// Homepage-specific metadata
export const generateMetadata = (): Metadata => {
  return {
    themeColor: getThemeColors(true),
  }
}

export default function Home() {
  return <main>{/* Your homepage content */}</main>
}
