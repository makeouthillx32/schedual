"use client";

import AboutUsPage from "@/components/home/AboutUs";
import BoardPage from "@/components/home/BoardofDirectors";
import Title9Page from "@/components/home/Title9Information";
import ActionDayPage from "@/components/home/ActionDayGala";
import JobsPage from "@/components/home/Jobs";
import HomePage from "@/components/home/Landing";

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
    default:
      return <HomePage />;
  }
};

export default MainContent;
