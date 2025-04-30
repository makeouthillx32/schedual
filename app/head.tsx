// This file is optional but can help with static metadata
export default function Head() {
  return (
    <>
      {/* These meta tags provide fallbacks for non-JS environments */}
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111827" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </>
  )
}
