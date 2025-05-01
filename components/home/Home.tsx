"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import useLoginSession from "@/lib/useLoginSession";
import Header from "@/components/home/Header";
import MobileMenu from "@/components/home/MobileMenu";
import IntroBar from "@/components/home/IntroBar";
import MainContent from "@/components/home/MainContent";
import useThemeCookie from "@/lib/useThemeCookie";
import Footer from "@/components/home/Footer";

export default function Home() {
  // ‼️ initial section comes from the hash so a cold load of /#about scrolls correctly
  const [currentPage, setCurrentPage] = useState<string>(() =>
    typeof window === "undefined" || !window.location.hash
      ? "home"
      : window.location.hash.slice(1)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useThemeCookie();
  const session = useLoginSession();

  /**
   * Shared helper: update state _and_ scroll to the section.
   */
  const goTo = useCallback((page: string) => {
    setCurrentPage(page);
    const el = document.getElementById(page);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // fallback for sections not yet mounted
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  /**
   * Click‑handler generator used by Header & MobileMenu.
   * ‑ pushes a history entry so Back/Forward works
   * ‑ closes the mobile menu
   */
  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setMobileMenuOpen(false);
    history.pushState(null, "", `#${page}`);
    goTo(page);
  };

  /**
   * Keep React state in sync with the address bar when the user
   * edits the hash manually or uses Back/Forward.
   */
  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.slice(1) || "home";
      goTo(page);
    };

    // run once on mount (cold refresh with a hash)
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [goTo]);

  return (
    <div className="home-page flex flex-col min-h-screen bg-[var(--home-background)] text-[var(--home-text)] dark:bg-[var(--home-background)] dark:text-[var(--home-text)]">
      <Header
        theme={theme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigateTo={navigateTo}
      />

      {mobileMenuOpen && (
        <MobileMenu
          navigateTo={navigateTo}
          session={session}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}

      {currentPage !== "home" && <IntroBar currentPage={currentPage} />}

      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* MainContent is still keyed off the state so it re-renders if the section is a virtual page */}
          <MainContent currentPage={currentPage} navigateTo={(page) => navigateTo(page)()} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
