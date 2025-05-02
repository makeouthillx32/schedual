"use client"; // Ensure this component is only rendered on the client-side

import React from "react";
import { FiArrowLeft } from "react-icons/fi"; // Icon used for the "Back to About" button

// Import page components for each route
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import Careers from "@/components/home/About/Careers";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";

// Service modules
import ProgramsAndServices from "@/components/home/ProgramsandServices/programsndseevices";
import Transportation from "@/components/home/services/Transportation";
import EarlyChildhood from "@/components/home/services/EarlyChildhood";
import SupportedLiving from "@/components/home/services/SupportedLiving";
import Artists from "@/components/home/services/Artists";
import AutismDayCamp from "@/components/home/services/AutismDayCamp";
import Employment from "@/components/home/services/Employment";

// Business services
import BusinessServices from "@/components/home/BusinessServices/main";
import CMSPage from "@/components/home/BusinessServices/cms"; // Commercial cleaning service page
import Pickup from "@/components/home/BusinessServices/pickup"; // Donation pickup service
import CARF from "@/components/home/services/CARF";
import ThriftStore from "@/components/home/services/ThriftStore";
import Shredding from "@/components/home/BusinessServices/Shredding";

// Engagement and legal modules
import GetInvolved from "@/components/home/GetInvolved/main";
import DonateNow from "@/components/home/GetInvolved/donatenow"; // Donation call-to-action
import LearnConnect from "@/components/home/LearnAndConnect/main";
import TermsPage from "@/components/home/TermsPage"; // Terms & conditions
import PrivacyPolicy from "@/components/home/PrivacyPolicy"; // Privacy statement

// Props definition for MainContent: determines which component to render
interface MainContentProps {
  currentPage: string;
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}

// A reusable "Back to About Us" button, shown on deeper-level pages
const BackButton = ({ navigateTo }: { navigateTo: (page: string) => (e?: React.MouseEvent) => void }) => (
  <div className="mb-4">
    <button
      onClick={navigateTo("about")}
      className="flex items-center gap-1 text-blue-600 text-sm underline hover:opacity-80"
    >
      <FiArrowLeft /> Back to About Us
    </button>
  </div>
);

/**
 * MainContent renders the correct page component based on the currentPage string.
 * Each case includes optional accessibility aids (
 *   <section id=.. className="sr-only">..</section>
 * ) and relevant navigation props.
 */
const MainContent: React.FC<MainContentProps> = ({ currentPage, navigateTo }) => {
  switch (currentPage) {
    // Landing page: no extra wrapper needed
    case "home":
      return <HomePage />;

    // About section and sub-pages
    case "about":
      return (
        <>
          {/* Hidden section for screen readers to associate the content */}
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
          <section id="jobs" className="sr-only">Job Openings</section>
          <JobsPage />
        </>
      );

    // Programs & Services overview
    case "programs":
      return (
        <>
          <section id="programs" className="sr-only">Programs & Services</section>
          <ProgramsAndServices navigateTo={navigateTo} />
        </>
      );

    // Individual program/service detail pages — include BackButton
    case "transportation":
      return <><BackButton navigateTo={navigateTo} /><Transportation /></>;
    case "early-childhood":
      return <><BackButton navigateTo={navigateTo} /><EarlyChildhood /></>;
    case "supported-living":
      return <><BackButton navigateTo={navigateTo} /><SupportedLiving /></>;
    case "artists":
      return <><BackButton navigateTo={navigateTo} /><Artists /></>;
    case "autism-day-camp":
      return (
        <>
          <section id="autismdaycamp" className="sr-only">Autism Day Camp</section>
          <BackButton navigateTo={navigateTo} />
          <AutismDayCamp />
        </>
      );
    case "employment":
      return <><BackButton navigateTo={navigateTo} /><Employment /></>;

    // Business services overview
    case "business":
      return (
        <>
          <section id="business" className="sr-only">Business & Commercial Services</section>
          <BusinessServices navigateTo={navigateTo} />
        </>
      );

    // Specific business service pages
    case "cms":
      return <CMSPage />;   // Commercial Cleaning Service
    case "pickup":
      return <Pickup />;    // Donation Pickup Service
    case "carf":
      return <><BackButton navigateTo={navigateTo} /><CARF /></>;
    case "thriftstore":
      return <><BackButton navigateTo={navigateTo} /><ThriftStore /></>;
    case "shredding":
      return <><BackButton navigateTo={navigateTo} /><Shredding /></>;

    // Community engagement pages
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
          {/* Pass navigateTo so donation flow can link internally */}
          <DonateNow navigateTo={navigateTo} />
        </>
      );

    // Learning & resources page
    case "learn":
      return (
        <>
          <section id="learn" className="sr-only">Learn & Connect</section>
          <LearnConnect />
        </>
      );

    // Legal pages
    case "terms":
      return <TermsPage />;       // Terms of Service
    case "privacy":
      return <PrivacyPolicy />;   // Privacy Policy

    // Fallback UI for routes not yet implemented
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
