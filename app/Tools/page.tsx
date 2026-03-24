"use client";

import MetaThemeColor from "@/components/MetaThemeColor";
import { tools } from "@/lib/toolsConfig";
import Link from "next/link";
import { useTheme } from "@/app/provider";

export default function ToolsPage() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";

  return (
    <>
      <MetaThemeColor type="app" />
      <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>

        <div
          className="sticky top-0 z-10 border-b px-4 pt-3 pb-3"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "hsl(var(--muted-foreground))" }}>
            DART
          </p>
          <h1 className="text-xl font-extrabold" style={{ color: "hsl(var(--foreground))" }}>
            Tools
          </h1>
        </div>

        <div className="max-w-2xl mx-auto px-3 pt-5 pb-16 space-y-3">
          {tools.map((tool) => (
            <Link key={tool.path} href={tool.path} className="block">
              <div
                className={`p-4 rounded-[var(--radius)] border transition-colors hover:border-[hsl(var(--sidebar-primary))] ${
                  isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"
                } border-[hsl(var(--border))]`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-[hsl(var(--foreground))]">
                        {tool.name}
                      </h2>
                      {tool.public && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Public
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                  <span className="text-[hsl(var(--muted-foreground))]">›</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </>
  );
}