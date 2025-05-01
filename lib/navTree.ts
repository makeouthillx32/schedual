// lib/navTree.ts – single source of truth for desktop & mobile nav
export const navTree = [
  {
    key: "about",
    label: "About",
    href: "/#about",
    children: [
      { key: "board", label: "Board of Directors", href: "/#board" },
      { key: "title9", label: "Title 9 Information", href: "/#title9" },
      { key: "careers", label: "Careers", href: "/#careers" },
    ],
  },
  {
    key: "programs",
    label: "Programs & Services",
    href: "/#programs",
    children: [
      { key: "transportation",   label: "Transportation",      href: "/#transportation" },
      { key: "employment",       label: "Employment Services", href: "/#employment" },
      { key: "early-childhood",  label: "Early Childhood",     href: "/#earlychildhood" },
      { key: "autism-day-camp",  label: "Autism Day Camp",     href: "/#autismdaycamp" },
      { key: "artists",          label: "Artists Guild",       href: "/#artists" },
      { key: "supported-living", label: "Supported Living",    href: "/#supportedliving" },
    ],
  },
  {
    key: "business",
    label: "Business Services",
    href: "/#business",
    children: [
      { key: "shredding",   label: "Shredding",           href: "/#shredding" },
      { key: "commercial",  label: "Commercial Services", href: "/#commercial" },
      { key: "donations",   label: "Donations & Pickups", href: "/#donations" },
    ],
  },
  {
    key: "involved",
    label: "Get Involved",
    href: "/#involved",
    children: [
      { key: "donate", label: "Donate Now", href: "/#donate" },
    ],
  },
  {
    key: "learn",
    label: "Learn & Connect",
    href: "/#learn",
    children: [
      { key: "autismdaycamp", label: "Autism Day Camp", href: "/#autismdaycamp" },
      { key: "thriftstore", label: "Thrift Store", href: "/#thriftstore" },
    ],
  },
] as const;