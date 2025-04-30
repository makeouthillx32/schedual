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
import { ThemeColorHandler } from "@/components/theme-color-handler"

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
    }
  }, [pathname])

  const excludeGlobalLayout = isHome

  return (
    <html lang="en" className={isDarkMode ? "dark" : ""} suppressHydrationWarning>
      <head>
        {/* Base theme-color that will be overridden by our handler */}
        <meta name="theme-color" content={isDarkMode ? "#111827" : "#ffffff"} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <Providers>
          {/* Add our ThemeColorHandler component */}
          <ThemeColorHandler isDarkMode={isDarkMode} />
          {!excludeGlobalLayout && <Nav />}
          <main>{children}</main>
          {!excludeGlobalLayout && <Footer />}
        </Providers>
      </body>
    </html>
  )
}
