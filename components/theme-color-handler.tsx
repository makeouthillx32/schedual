"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

interface ThemeColorHandlerProps {
  isDarkMode: boolean
}

export function ThemeColorHandler({ isDarkMode }: ThemeColorHandlerProps) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    if (typeof window === "undefined") return

    // Get the computed color based on the current theme and page
    const computedStyle = getComputedStyle(document.documentElement)
    let color: string

    if (isHome) {
      color = isDarkMode
        ? computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#2d3142"
        : computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#ffffff"
    } else {
      color = isDarkMode
        ? computedStyle.getPropertyValue("--hnf-background")?.trim() || "#111827"
        : computedStyle.getPropertyValue("--hnf-background")?.trim() || "#f9fafb"
    }

    // Update the existing meta tag
    const metaTag = document.querySelector("meta[name='theme-color']")
    if (metaTag) {
      metaTag.setAttribute("content", color)
    }

    // iOS Chromium-specific fixes

    // 1. Create/update a duplicate meta tag with a different name
    // This forces Chromium to re-evaluate the theme color
    let chromiumFix = document.querySelector("meta[name='theme-color-ios-fix']")
    if (!chromiumFix) {
      chromiumFix = document.createElement("meta")
      chromiumFix.setAttribute("name", "theme-color-ios-fix")
      document.head.appendChild(chromiumFix)
    }
    chromiumFix.setAttribute("content", color)

    // 2. Add iOS-specific meta tags
    let appleMobileWebAppCapable = document.querySelector("meta[name='apple-mobile-web-app-capable']")
    if (!appleMobileWebAppCapable) {
      appleMobileWebAppCapable = document.createElement("meta")
      appleMobileWebAppCapable.setAttribute("name", "apple-mobile-web-app-capable")
      appleMobileWebAppCapable.setAttribute("content", "yes")
      document.head.appendChild(appleMobileWebAppCapable)
    }

    let appleMobileWebAppStatusBarStyle = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']")
    if (!appleMobileWebAppStatusBarStyle) {
      appleMobileWebAppStatusBarStyle = document.createElement("meta")
      appleMobileWebAppStatusBarStyle.setAttribute("name", "apple-mobile-web-app-status-bar-style")
      appleMobileWebAppStatusBarStyle.setAttribute("content", "default")
      document.head.appendChild(appleMobileWebAppStatusBarStyle)
    }

    // 3. Force a repaint on iOS browsers
    // This helps trigger the status bar color change
    const body = document.body
    const originalDisplay = body.style.display
    body.style.display = "none"
    // Force reflow
    void body.offsetHeight
    body.style.display = originalDisplay

    // 4. Viewport manipulation trick for iOS Chromium
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      const originalContent = viewport.getAttribute("content") || ""
      viewport.setAttribute("content", originalContent + ",maximum-scale=1.001")
      setTimeout(() => {
        viewport.setAttribute("content", originalContent)
      }, 10)
    } else {
      // Create viewport meta if it doesn't exist
      const newViewport = document.createElement("meta")
      newViewport.setAttribute("name", "viewport")
      newViewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.001",
      )
      document.head.appendChild(newViewport)
      setTimeout(() => {
        newViewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover")
      }, 10)
    }
  }, [isDarkMode, isHome])

  return null
}
