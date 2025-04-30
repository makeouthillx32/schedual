"use client"

import { useEffect } from "react"

export function ThemeColorObserver() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Function to update the status bar color based on the current theme
    const updateStatusBarColor = () => {
      try {
        // Check if we're in dark mode
        const isDarkMode = document.documentElement.classList.contains("dark")

        // Get the pathname to determine if we're on the home page
        const isHome = window.location.pathname === "/"

        // Get the computed style
        const computedStyle = getComputedStyle(document.documentElement)

        // Determine the color based on the page and theme
        let color
        if (isHome) {
          color = isDarkMode
            ? computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#2d3142"
            : computedStyle.getPropertyValue("--home-nav-bg")?.trim() || "#ffffff"
        } else {
          color = isDarkMode
            ? computedStyle.getPropertyValue("--hnf-background")?.trim() || "#111827"
            : computedStyle.getPropertyValue("--hnf-background")?.trim() || "#f9fafb"
        }

        console.log("Theme changed, updating status bar to:", color, "Dark mode:", isDarkMode)

        // Update the theme-color meta tag
        const metaTag = document.querySelector('meta[name="theme-color"]')
        if (metaTag) {
          metaTag.setAttribute("content", color)
        }

        // Update iOS-specific meta tags
        const isIOS =
          /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

        if (isIOS) {
          // Add iOS-specific meta tags
          const metaTags = [
            { name: "apple-mobile-web-app-capable", content: "yes" },
            { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
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
      } catch (error) {
        console.error("Error updating status bar color:", error)
      }
    }

    // Update immediately on mount
    updateStatusBarColor()

    // Set up a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target === document.documentElement
        ) {
          updateStatusBarColor()
        }
      })
    })

    // Start observing the html element for class changes
    observer.observe(document.documentElement, { attributes: true })

    // Also listen for storage events (in case theme is changed in another tab)
    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        updateStatusBarColor()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Clean up
    return () => {
      observer.disconnect()
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return null
}
