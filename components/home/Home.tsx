"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/home/Header";
import SectionPanel from "@/components/home/SectionPanel";
import BackButton from "@/components/home/_components/BackButton";
import AnchorSection from "@/components/home/_components/AnchorSection";
import { pageTree, sectionId } from "@/components/home/_components/pageTree";
import Footer from "@/components/footer"; // Changed from home/Footer to footer
import useThemeCookie from "@/lib/useThemeCookie";

export default function Home() {
  useThemeCookie(); // Persist theme

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
    []
  );

  const navigateTo = (page: string) => (e?: React.MouseEvent) => {
    e?.preventDefault();
    history.pushState(null, "", `#${page}`);
    goTo(page);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const sync = () => goTo(location.hash.replace("#", "") || "home");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [goTo]);

  // Pull component & metadata from pageTree
  const config = pageTree[currentPage];
  if (!config) return null;
  const { Component, backKey, backLabel, anchorId } = config;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        theme="light"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navigateTo={navigateTo}
      />

      <main className="flex-grow">
        <SectionPanel currentPage={currentPage}>
          {backKey && <BackButton navigateTo={navigateTo} backKey={backKey} label={backLabel} />}
          {anchorId && <AnchorSection id={anchorId} />}
          <Component navigateTo={navigateTo} />
        </SectionPanel>
      </main>

      <Footer />
    </div>
  );
}