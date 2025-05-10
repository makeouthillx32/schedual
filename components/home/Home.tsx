"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/home/Header";
import SectionPanel from "@/components/home/SectionPanel";
import MainContent from "@/components/home/MainContent";
import Footer from "@/components/home/Footer";
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  // Persist theme (light/dark) from cookie on first render
  useThemeCookie();

  // Map hashes → canonical section IDs
  const sectionId: Record<string, string> = {
    home: "home",
    about: "about",
    programs: "programs",
    business: "business",
    involved: "involved",
    learn: "learn",
    board: "board",
    title9: "title9",
    jobs: "jobs",
    careers: "careers",
    autismdaycamp: "autismdaycamp",
    transportation: "transportation",
    earlychildhood: "earlychildhood",
    supportedliving: "supportedliving",
    artists: "artists",
    employment: "employment",
    carf: "carf",
    thriftstore: "thriftstore",
    shredding: "shredding",
  };

  const [currentPage, setCurrentPage] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigate to hash and smooth‑scroll there
  const goTo = useCallback(
    (hash: string) => {
      const [base, sub] = hash.split("/");
      const pageKey = sub && sectionId[sub] ? sub : base;
      const target = sectionId[pageKey] ?? pageKey;
      setCurrentPage(target);

      requestAnimationFrame(() => {
        setTimeout(() => {
          const scrollToId = sub || target;
          const el = document.getElementById(scrollToId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            document.documentElement.scrollIntoView({ behavior: "smooth" });
          }
        }, 10);
      });
    },
    [sectionId]
  );

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    history.pushState(null, "", `#${page}`);
    goTo(page);
    setMobileMenuOpen(false);
  };

  // Sync on first load + hash changes
  useEffect(() => {
    const sync = () => goTo(location.hash.replace("#", "") || "home");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [goTo]);

  return (
    <div className="flex min-h-screen flex-col home-page bg-[var(--home-background)] text-[var(--home-text)] dark:text-white">
      <Header
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigateTo={navigateTo}
      />

      {/* Ribbon + card wrapper */}
      <main className="flex-grow">
        <SectionPanel currentPage={currentPage}>
          <MainContent currentPage={currentPage} navigateTo={navigateTo} />
        </SectionPanel>
      </main>

      <Footer />
    </div>
  );
}
