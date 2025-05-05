"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NAV_DATA } from "./data/nav-data"
import MenuItem from "./menu-item"

export default function Sidebar() {
  const pathname = usePathname()
  const userId = "me" // Replace with actual dynamic ID if needed
  const navData = NAV_DATA(userId)

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    navData.some((section) => {
      return section.items.some((item) => {
        return item.items.some((subItem) => {
          if (subItem.url === pathname) {
            setOpenMenus((prev) => ({
              ...prev,
              [item.title]: true,
            }))
            return true
          }
          return false
        })
      })
    })
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