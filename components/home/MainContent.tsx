"use client";

import { FiArrowLeft } from "react-icons/fi";
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
import GetInvolved from "@/components/home/GetInvolved/main";
import LearnConnect from "@/components/home/LearnAndConnect/main";
import Careers from "@/components/home/About/Careers";

interface MainContentProps {
  currentPage: string;
  navigateTo: (page: string) => void;
}

const BackButton = ({ navigateTo }: { navigateTo: (page: string) => void }) => (
  <div className="mb-4">
    <button
      onClick={() => navigateTo("about")}
      className="flex items-center gap-1 text-blue-600 text-sm underline hover:opacity-80"
    >
      <FiArrowLeft /> Back to About Us
    </button>
  </div>
);

/**
 * Switches between Landing, About, and service-detail pages.
 * Keys MUST match navTree keys exactly.
 */
const MainContent: React.FC<MainContentProps> = ({ currentPage, navigateTo }) => {
  switch (currentPage) {
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
    case "action":
      return (
        <>
          <section id="action" className="sr-only">Action Day Gala</section>
          <AutismDayCamp />
        </>
      );
    case "careers":
      return (
        <>
          <section id="careers" className="sr-only">Careers</section>
          <JobsPage />
        </>
      );
    case "programs":
      return (
        <>
          <section id="programs" className="sr-only">Programs</section>
          <ProgramsAndServices navigateTo={navigateTo} />
        </>
      );

    /* ───────────────── Programs & Services ───────────────── */
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

    /* ───────────────── Business Services ─────────────────── */
    case "business":
      return (
        <>
          <section id="business" className="sr-only">Business Services</section>
          <BusinessServices navigateTo={navigateTo} />
        </>
      );
    case "carf":
      return <><BackButton navigateTo={navigateTo} /><CARF /></>;
    case "thriftstore":
      return <><BackButton navigateTo={navigateTo} /><ThriftStore /></>;
    case "shredding":
      return <><BackButton navigateTo={navigateTo} /><Shredding /></>;

    /* ───────────────── Community ───────────────── */
    case "involved":
      return (
        <>
          <section id="involved" className="sr-only">Get Involved</section>
          <GetInvolved />
        </>
      );
    case "learn":
      return (
        <>
          <section id="learn" className="sr-only">Learn & Connect</section>
          <LearnConnect />
        </>
      );

    default:
      return <HomePage />;
  }
};

export default MainContent;