"use client"; // This directive ensures the component is rendered on the client side only

import React from "react";
import { FiArrowLeft } from "react-icons/fi"; // Arrow icon for the "Back to About Us" button

// Primary page sections and their components
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import Careers from "@/components/home/About/Careers";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";

// Programs & services overview and detailed pages
import ProgramsAndServices from "@/components/home/ProgramsandServices/programsndseevices";
import Transportation from "@/components/home/services/Transportation";
import EarlyChildhood from "@/components/home/services/EarlyChildhood";
import SupportedLiving from "@/components/home/services/SupportedLiving";
import Artists from "@/components/home/services/Artists";
import AutismDayCamp from "@/components/home/LearnAndConnect/AutismDayCamp";
import Employment from "@/components/home/services/Employment";

// Business & commercial services
import BusinessServices from "@/components/home/BusinessServices/main";
import CMSPage from "@/components/home/BusinessServices/cms";       // Commercial cleaning service
import Pickup from "@/components/home/BusinessServices/pickup";     // Donation pickup service
import CARF from "@/components/home/services/CARF";
import ThriftStore from "@/components/home/services/ThriftStore";
import Shredding from "@/components/home/BusinessServices/Shredding";

// Community engagement and legal pages
import GetInvolved from "@/components/home/GetInvolved/main";
import DonateNow from "@/components/home/GetInvolved/donatenow";     // Donation CTA component
import LearnConnect from "@/components/home/LearnAndConnect/main";
import TermsPage from "@/components/home/TermsPage";              // Terms & Conditions
import PrivacyPolicy from "@/components/home/PrivacyPolicy";      // Privacy Policy

/**
 * Props for MainContent component:
 * - currentPage: the active route key
 * - navigateTo: function to handle internal navigation
 */
interface MainContentProps {
  currentPage: string;
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}

/**
 * BackButton: reusable component for navigating back to the "About" section.
 */
const BackButton = ({ navigateTo }: {
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}) => (
  <div className="mb-4">
    <button
      onClick={navigateTo("about")}  // navigate back to the About page
      className="flex items-center gap-1 text-blue-600 text-sm underline hover:opacity-80"
    >
      <FiArrowLeft /> Back to About Us
    </button>
  </div>
);

/**
 * MainContent: renders different page components according to `currentPage`.
 * Each `case` may include hidden <section> tags for accessibility and
 * custom navigation props where needed.
 */
const MainContent: React.FC<MainContentProps> = ({ currentPage, navigateTo }) => {
  switch (currentPage) {
    // --- Landing Page ---
    case "home":
      return <HomePage />;

    // --- About Section ---
    case "about":
      return (
        <>
          {/* Assistive hidden section landmark */}
          <section id="about" className="sr-only">About</section>
          <AboutUsPage navigateTo={navigateTo} />
        </>
      );
    case "board":
      return (
        <>
          <section id="board" className="sr-only">Board of Directors</section>
          <BoardPage />
        </>
      );
    case "title9":
      return (
        <>
          <section id="title9" className="sr-only">Title IX Information</section>
          <Title9Page />
        </>
      );
    case "careers":
      return (
        <>
          <section id="careers" className="sr-only">Careers</section>
          <Careers navigateTo={navigateTo} />
        </>
      );
    case "jobs":
      return (
        <>
          <section id="jobs" className="sr-only">Jobs</section>
          <JobsPage />
        </>
      );

    // --- Programs & Services Overview ---
    case "programs":
      return (
        <>
          <section id="programs" className="sr-only">Programs & Services</section>
          <ProgramsAndServices navigateTo={navigateTo} />
        </>
      );

    // --- Detailed Service Pages ---
    case "transportation":
      return <><BackButton navigateTo={navigateTo} /><Transportation /></>;
    case "early-childhood":
      return <><BackButton navigateTo={navigateTo} /><EarlyChildhood /></>;
    case "supported-living":
      return <><BackButton navigateTo={navigateTo} /><SupportedLiving /></>;
    case "artists":
      return <><BackButton navigateTo={navigateTo} /><Artists /></>;
    case "autismdaycamp":
      return (
        <>
          <section id="autismdaycamp" className="sr-only">Autism Day Camp</section>
          <BackButton navigateTo={navigateTo} />
          <AutismDayCamp />
        </>
      );
    case "employment":
      return <><BackButton navigateTo={navigateTo} /><Employment /></>;

    // --- Business & Commercial Services ---
    case "business":
      return (
        <>
          <section id="business" className="sr-only">Business & Commercial Services</section>
          <BusinessServices navigateTo={navigateTo} />
        </>
      );
    case "commercial":
      return <CMSPage />;   // Commercial Cleaning
    case "donations":
      return <Pickup />;    // Donation Pickup
    case "carf":
      return <><BackButton navigateTo={navigateTo} /><CARF /></>;
    case "thriftstore":
      return <><BackButton navigateTo={navigateTo} /><ThriftStore /></>;
    case "shredding":
      return <><BackButton navigateTo={navigateTo} /><Shredding /></>;

    // --- Community Engagement ---
    case "involved":
      return (
        <>
          <section id="involved" className="sr-only">Get Involved</section>
          <GetInvolved />
        </>
      );
    case "donate":
      return (
        <>
          <section id="donate" className="sr-only">Donate Now</section>
          {/* Pass navigateTo for potential in-donor navigation */}
          <DonateNow navigateTo={navigateTo} />
        </>
      );

    // --- Learn & Connect ---
    case "learn":
      return (
        <>
          <section id="learn" className="sr-only">Learn & Connect</section>
          <LearnConnect />
        </>
      );

    // --- Legal ---
    case "terms":
      return <TermsPage />;     // Terms of Service component
    case "privacy":
      return <PrivacyPolicy />; // Privacy Policy component

    // --- Fallback for undefined routes ---
    default:
      return (
        <div className="p-8 text-center text-[var(--home-text)]">
          <h1 className="text-3xl font-bold mb-4">Page Coming Soon</h1>
          <p className="text-lg">We're working on this section. Please check back soon!</p>
        </div>
      );
  }
};

export default MainContent;
