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

  const goTo = useCallback((page: string) => {
    const target = sectionId[page] ?? page;
    setCurrentPage(target);

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

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    history.pushState(null, "", `#${page}`);
    goTo(page);
    setMobileMenuOpen(false); // always close mobile nav after click
  };

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

      <IntroBar currentPage={currentPage} />

      <main className="flex-grow">
        <MainContent currentPage={currentPage} navigateTo={navigateTo} />
      </main>

      <Footer />
    </div>
  );
}