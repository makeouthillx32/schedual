"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import ActionDayPage from "@/components/home/ActionDayGala";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";

export default function Home() {
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="home-page flex flex-col min-h-screen">
      <header className="border-b border-gray-200 py-2 px-4 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-lg">
            <a href="#" onClick={navigateTo("home")} className="flex items-center">
              <img src="/images/home/dartlogo.svg" alt="DART Logo" width={80} height={80} className="h-12 w-auto" />
            </a>
          </div>
          <nav className="hidden md:flex space-x-6 text-sm">
            <a href="#" onClick={navigateTo("about")} className="hover:underline">About Us</a>
            <a href="#" onClick={navigateTo("board")} className="hover:underline">Board of Directors</a>
            <a href="#" onClick={navigateTo("title9")} className="hover:underline">Title 9 Information</a>
            <a href="#" onClick={navigateTo("action")} className="hover:underline">Autism Day Camp</a>
            <a href="#" onClick={navigateTo("jobs")} className="hover:underline">Jobs</a>
          </nav>
          <button
            className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
            <div className="flex flex-col py-2">
              <a href="#" onClick={navigateTo("about")} className="px-4 py-2 hover:bg-gray-100">About Us</a>
              <a href="#" onClick={navigateTo("board")} className="px-4 py-2 hover:bg-gray-100">Board of Directors</a>
              <a href="#" onClick={navigateTo("title9")} className="px-4 py-2 hover:bg-gray-100">Title 9 Information</a>
              <a href="#" onClick={navigateTo("action")} className="px-4 py-2 hover:bg-gray-100">Autism Day Camp</a>
              <a href="#" onClick={navigateTo("jobs")} className="px-4 py-2 hover:bg-gray-100">Jobs</a>
            </div>
          </div>
        )}
      </header>

      {currentPage !== "home" && (
        <div className="bg-blue-500 h-12 md:h-16 flex items-center justify-center">
          <h1 className="text-white text-xl md:text-2xl font-semibold">
            {currentPage === "about"
              ? "About Us"
              : currentPage === "board"
              ? "Board of Directors"
              : currentPage === "title9"
              ? "Title 9 Information"
              : currentPage === "action"
              ? "Autism Day Camp"
              : currentPage === "jobs"
              ? "Jobs"
              : ""}
          </h1>
        </div>
      )}

      <main className="flex-grow bg-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {currentPage === "home" && <HomePage />}
          {currentPage === "about" && <AboutUsPage />}
          {currentPage === "board" && <BoardPage />}
          {currentPage === "title9" && <Title9Page />}
          {currentPage === "action" && <ActionDayPage />}
          {currentPage === "jobs" && <JobsPage />}
        </div>
      </main>

      <footer className="bg-white py-4 text-center text-xs text-gray-500 border-t border-gray-200">
        © 2023 Desert Area Resources and Training (DART)
      </footer>
    </div>
  );
}
