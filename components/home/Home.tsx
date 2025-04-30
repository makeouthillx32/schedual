"use client";

import type React from "react";
import { useState, useEffect } from "react";
import useLoginSession from "@/lib/useLoginSession";
import Header from "@/components/home/Header";
import MobileMenu from "@/components/home/MobileMenu";
import IntroBar from "@/components/home/IntroBar";
import MainContent from "@/components/home/MainContent";
import useThemeCookie from "@/lib/useThemeCookie";
import Footer from "@/components/home/Footer";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useThemeCookie();
  const session = useLoginSession();

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

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
          <MainContent currentPage={currentPage} navigateTo={(page) => navigateTo(page)()} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
