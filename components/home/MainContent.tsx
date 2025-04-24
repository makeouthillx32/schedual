"use client";

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
      return <Transportation />;
    case "earlychildhood":
      return <EarlyChildhood />;
    case "supportedliving":
      return <SupportedLiving />;
    case "artists":
      return <Artists />;
    case "employment":
      return <Employment />;
    case "carf":
      return <CARF />;
    case "thrift":
      return <ThriftStore />;
    case "shredding":
      return <Shredding />;
    default:
      return <HomePage />;
  }
};

export default MainContent;