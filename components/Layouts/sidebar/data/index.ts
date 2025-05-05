"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NAV_DATA } from "./data/nav-data"
import MenuItem from "./menu-item"
import { getUserProfile } from "@/lib/getUserProfile"

export default function Sidebar() {
  const pathname = usePathname()
  const [userId, setUserId] = useState<string | null>(null)
  const navData = NAV_DATA("me") // Still build menu with "me" links

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Fetch and store UUID if needed
    getUserProfile().then((profile) => {
      if (profile?.id) setUserId(profile.id)
    })
  }, [])

  useEffect(() => {
    navData.some((section) =>
      section.items.some((item) =>
        item.items.some((subItem) => {
          if (subItem.url === pathname) {
            setOpenMenus((prev) => ({
              ...prev,
              [item.title]: true,
            }))
            return true
          }
          return false
        })
      )
    )
  }, [pathname, navData])

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 shadow-lg h-screen sticky top-0">
      <nav className="p-4">
        {navData.map((section, index) => (
          <div key={index} className="mb-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">{section.label}</p>
            <ul>
              {section.items.map((item, idx) => (
                <MenuItem
                  key={idx}
                  item={item}
                  pathname={pathname}
                  isOpen={openMenus[item.title]}
                  toggleOpen={() =>
                    setOpenMenus((prev) => ({
                      ...prev,
                      [item.title]: !prev[item.title],
                    }))
                  }
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}