"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/home/Header";
import IntroBar from "@/components/home/IntroBar";
import MainContent from "@/components/home/MainContent";
import Footer from "@/components/home/Footer";
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  useThemeCookie();

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
    autismdaycamp: "autismdaycamp",
  };

  const [currentPage, setCurrentPage] = useState<string>("home");

  /** Jump helper shared by header + hashchange listener */
  const goTo = useCallback((page: string) => {
    const target = sectionId[page] ?? page;
    setCurrentPage(target);

    // Delay scroll until DOM updates are flushed
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          document.documentElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 10);
    });
  }, []);

  /** click‑handler factory injected into Header / MobileDrawer */
  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    history.pushState(null, "", `#${page}`);
    goTo(page);
  };

  useEffect(() => {
    const sync = () => goTo(location.hash.replace("#", "") || "home");
    sync();
    addEventListener("hashchange", sync);
    return () => removeEventListener("hashchange", sync);
  }, [goTo]);

  return (
    <div className="flex min-h-screen flex-col home-page bg-[var(--home-background)] text-[var(--home-text)] dark:text-white">
      <Header
        theme="light"
        mobileMenuOpen={false}
        setMobileMenuOpen={() => {}}
        navigateTo={navigateTo}
      />

      <IntroBar currentPage={currentPage} />

      <main className="flex-grow">
        <MainContent currentPage={currentPage} navigateTo={navigateTo} />
      </main>

      <Footer />
    </div>
  );
}
