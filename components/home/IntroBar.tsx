"use client";

import React from "react";

interface IntroBarProps {
  currentPage: string;
}

const labels: Record<string, string> = {
  about: "About Us",
  board: "Board of Directors",
  title9: "Title 9 Information",
  careers: "Careers",
  jobs: "Jobs",
  programs: "Programs & Services",
  transportation: "Transportation",
  "early-childhood": "Early Childhood Services",
  "supported-living": "Supported Living Services",
  artists: "Artists on the Edge",
  "autism-day-camp": "Autism Day Camp",
  employment: "Employment Services",
  business: "Business Services",
  commercial: "Commercial Cleaning Services",
  pickup: "Donation Pick‑Up",
  donate: "Donate Now",
  involved: "Get Involved",
  learn: "Learn & Connect",
  carf: "CARF Accreditation",
  thriftstore: "DART Thrift Store",
  shredding: "Secure Document Shredding",
};

const IntroBar: React.FC<IntroBarProps> = ({ currentPage }) => {
  // no bar on the home page
  if (currentPage === "home") return null;

  const label = labels[currentPage];
  if (!label) return null;

  return (
    <div className="bg-blue-500 h-12 md:h-16 flex items-center justify-center">
      <div className="text-white text-xl md:text-2xl font-semibold">
        {label}
      </div>
    </div>
  );
};

export default IntroBar;