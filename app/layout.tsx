// app/layout.tsx

"use client"

import type React from "react"

import { Providers } from "./provider"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import "./globals.css"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { setCookie } from "@/lib/cookieUtils"
import { IOSStatusBarFix } from "@/components/ios-status-bar-fix"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isHome = pathname === "/"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up" || pathname.startsWith("/auth")

      if (!isAuthPage) {
        setCookie("lastPage", pathname, { path: "/" })
      }

      const theme = localStorage.getItem("theme") || "light"
      setIsDarkMode(theme === "dark")

      const computedStyle = getComputedStyle(document.documentElement)
      let color = "#ffffff" // fallback

      if (isHome) {
        color =
          theme === "dark"
            ? computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#2d3142"
            : computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#ffffff"
      } else {
        color =
          theme === "dark"
            ? computedStyle.getPropertyValue("--hnf-background")?.trim() || "#111827"
            : computedStyle.getPropertyValue("--hnf-background")?.trim() || "#f9fafb"
      }

      const metaTag = document.querySelector("meta[name='theme-color']")
      if (metaTag) {
        metaTag.setAttribute("content", color)
      } else {
        const newMeta = document.createElement("meta")
        newMeta.name = "theme-color"
        newMeta.content = color
        document.head.appendChild(newMeta)
      }

      // iOS Chromium fix - Add this script to your existing useEffect
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

      if (isIOS) {
        // Add iOS-specific meta tags
        const metaTags = [
          { name: "apple-mobile-web-app-capable", content: "yes" },
          { name: "apple-mobile-web-app-status-bar-style", content: "default" },
          // This is our special duplicate tag that helps iOS Chromium
          { name: "theme-color-ios", content: color },
        ]

        metaTags.forEach(({ name, content }) => {
          let tag = document.querySelector(`meta[name="${name}"]`)
          if (!tag) {
            tag = document.createElement("meta")
            tag.setAttribute("name", name)
            document.head.appendChild(tag)
          }
          tag.setAttribute("content", content)
        })
      }
    }
  }, [pathname])

  const excludeGlobalLayout = isHome

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        {/* Add viewport meta tag for iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Add our iOS status bar fix component */}
        <IOSStatusBarFix />
      </head>
      <body>
        <Providers>
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  )
}
