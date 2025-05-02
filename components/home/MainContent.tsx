"use client"; // This component runs only on the client-side

import { FiArrowLeft } from "react-icons/fi"; // Icon for back button

// Page components
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";
import Transportation from "@/components/home/services/Transportation";
import EarlyChildhood from "@/components/home/services/EarlyChildhood";
import SupportedLiving from "@/components/home/services/SupportedLiving";
import Artists from "@/components/home/services/Artists";
import AutismDayCamp from "@/components/home/services/AutismDayCamp";
import Employment from "@/components/home/services/Employment";
import CARF from "@/components/home/services/CARF";
import ThriftStore from "@/components/home/services/ThriftStore";
import Shredding from "@/components/home/services/Shredding";
import ProgramsAndServices from "@/components/home/ProgramsandServices/programsndseevices";
import BusinessServices from "@/components/home/BusinessServices/main";
import CMSPage from "@/components/home/BusinessServices/cms"; // CMS service page
import Pickup from "@/components/home/BusinessServices/pickup"; // Pickup donation service
import GetInvolved from "@/components/home/GetInvolved/main";
import DonateNow from "@/components/home/GetInvolved/donatenow"; // Donation call-to-action page
import LearnConnect from "@/components/home/LearnAndConnect/main";
import Careers from "@/components/home/About/Careers";
import TermsPage from "@/components/home/TermsPage"; // Terms of Service
import PrivacyPolicy from "@/components/home/PrivacyPolicy"; // Privacy policy

// Props for MainContent component
interface MainContentProps {
  currentPage: string;
  navigateTo: (page: string) => (e?: React.MouseEvent) => void;
}

// Reusable BackButton for deeper pages, navigates back to About section
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

// MainContent renders the appropriate page based on the currentPage key
const MainContent: React.FC<MainContentProps> = ({ currentPage, navigateTo }) => {
  switch (currentPage) {
    // Landing page
    case "home":
      return <HomePage />;

    // About section pages
    case "about":
      return (
        <>
          <section id="about" className="sr-only">About</section>
          <AboutUsPage navigateTo={navigateTo} />
        </>
      );
    case "board":
      return (
        <>
          <section id="board" className="sr-only">Board</section>
          <BoardPage />
        </>
      );
    case "title9":
      return (
        <>
          <section id="title9" className="sr-only">Title 9</section>
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

    // Programs & services overview
    case "programs":
      return (
        <>
          <section id="programs" className="sr-only">Programs</section>
          <ProgramsAndServices navigateTo={navigateTo} />
        </>
      );

    // Detailed service pages with a back button
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
          <section id="business" className="sr-only">Business Services</section>
          <BusinessServices navigateTo={navigateTo} />
        </>
      );

    // Additional business-related pages
    case "cms":
      return <CMSPage />; // Commercial cleaning CMS page
    case "pickup":
      return <Pickup />; // Pickup donation service page

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
          <section id="donate" className="sr-only">Give</section>
          <DonateNow navigateTo={navigateTo} />
        </>
      );

    // Learning & resources
    case "learn":
      return (
        <>
          <section id="learn" className="sr-only">Learn & Connect</section>
          <LearnConnect />
        </>
      );

    // Legal pages
    case "terms":
      return <TermsPage />; // Terms of Service
    case "privacy":
      return <PrivacyPolicy />; // Privacy Policy

    // Fallback for unimplemented pages
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
