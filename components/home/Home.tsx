"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import ActionDayPage from "@/components/home/ActionDayGala";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";
import SwitchtoDarkMode from "@/components/SwitchtoDarkMode";
import useLoginSession from "@/lib/useLoginSession";
import SignInButton from "@/components/ui/SignInButton";
import LogoutButton from "@/components/ui/LogoutButton";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import MobileMenu from "@/components/home/MobileMenu";
import IntroBar from "@/components/home/IntroBar";
import MainContent from "@/components/home/MainContent";
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useThemeCookie();
  const session = useLoginSession();

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="home-page flex flex-col min-h-screen bg-[var(--home-background)] text-[var(--home-text)]">
        <Header
          theme={theme}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navigateTo={(page) => (e) => {
            e.preventDefault();
            navigateTo(page);
          }}
        />
        {mobileMenuOpen && (
          <MobileMenu
            navigateTo={(page) => (e) => {
              e.preventDefault();
              navigateTo(page);
            }}
            session={session}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {currentPage !== "home" && <IntroBar currentPage={currentPage} />}

        <main className="flex-grow">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <MainContent currentPage={currentPage} navigateTo={navigateTo} />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
