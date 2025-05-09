// lib/navTree.ts – single source of truth for desktop & mobile nav
export const navTree = [
  {
    key: "about",
    label: "About",
    title: "About",
    href: "/#about",
    children: [
      {
        key: "board",
        label: "Board of Directors",
        title: "Board of Directors",
        href: "/#board",
      },
      {
        key: "title9",
        label: "Title 9 Information",
        title: "Title 9 Information",
        href: "/#title9",
      },
      {
        key: "careers",
        label: "Careers",
        title: "Careers",
        href: "/#careers",
      },
    ],
  },
  {
    key: "programs",
    label: "Programs & Services",
    title: "Programs & Services",
    href: "/#programs",
    children: [
      {
        key: "transportation",
        label: "Transportation",
        title: "Transportation",
        href: "/#transportation",
      },
      {
        key: "employment",
        label: "Employment Services",
        title: "Employment Services",
        href: "/#employment",
      },
      {
        key: "early-childhood",
        label: "Early Childhood",
        title: "Early Childhood",
        href: "/#early-childhood",
      },
      {
        key: "autism-day-camp",
        label: "Autism Day Camp",
        title: "Autism Day Camp",
        href: "/#autism-day-camp",
      },
      {
        key: "artists",
        label: "Artists Guild",
        title: "Artists Guild",
        href: "/#artists",
      },
      {
        key: "supported-living",
        label: "Supported Living",
        title: "Supported Living",
        href: "/#supported-living",
      },
    ],
  },
  {
    key: "business",
    label: "Business Services",
    title: "Business Services",
    href: "/#business",
    children: [
      {
        key: "shredding",
        label: "Shredding",
        title: "Shredding",
        href: "/#shredding",
      },
      {
        key: "commercial",
        label: "Commercial Services",
        title: "Commercial Services",
        href: "/#cms",
      },
      {
        key: "pickup",
        label: "Donations & Pickups",
        title: "Donations & Pickups",
        href: "/#pickup",
      },
    ],
  },
  {
    key: "involved",
    label: "Get Involved",
    title: "Get Involved",
    href: "/#involved",
    children: [
      {
        key: "donate",
        label: "Donate Now",
        title: "Donate Now",
        href: "/#donate",
      },
    ],
  },
  {
    key: "learn",
    label: "Learn & Connect",
    title: "Learn & Connect",
    href: "/#learn",
    children: [
      {
        key: "thriftstore",
        label: "Thrift Store",
        title: "Thrift Store",
        href: "/#thriftstore",
      },
    ],
  },
] as const;