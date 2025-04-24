"use client";

import { FiArrowLeft } from "react-icons/fi";
import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import ActionDayPage from "@/components/home/ActionDayGala";
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

const MainContent: React.FC<MainContentProps> = ({ currentPage, navigateTo }) => {
  switch (currentPage) {
    case "about":
      return <AboutUsPage navigateTo={navigateTo} />;
    case "board":
      return <BoardPage />;
    case "title9":
      return <Title9Page />;
    case "action":
      return <ActionDayPage />;
    case "jobs":
      return <JobsPage />;
    case "transportation":
      return <><BackButton navigateTo={navigateTo} /><Transportation /></>;
    case "earlychildhood":
      return <><BackButton navigateTo={navigateTo} /><EarlyChildhood /></>;
    case "supportedliving":
      return <><BackButton navigateTo={navigateTo} /><SupportedLiving /></>;
    case "artists":
      return <><BackButton navigateTo={navigateTo} /><Artists /></>;
    case "employment":
      return <><BackButton navigateTo={navigateTo} /><Employment /></>;
    case "carf":
      return <><BackButton navigateTo={navigateTo} /><CARF /></>;
    case "thrift":
      return <><BackButton navigateTo={navigateTo} /><ThriftStore /></>;
    case "shredding":
      return <><BackButton navigateTo={navigateTo} /><Shredding /></>;
    default:
      return <HomePage />;
  }
};

export default MainContent;
