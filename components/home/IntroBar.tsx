"use client";

import React from "react";

interface IntroBarProps {
  currentPage: string;
}

const labels: Record<string, string> = {
  home: "Welcome",
  about: "About Us",
  board: "Board of Directors",
  title9: "Title 9 Information",
  careers: "Careers",                          // added
  jobs: "Jobs",
  programs: "Programs & Services",
  transportation: "Transportation",
  "early-childhood": "Early Childhood Services",  // dash-version
  "supported-living": "Supported Living Services",// dash-version
  artists: "Artists on the Edge",
  "autism-day-camp": "Autism Day Camp",        // dash-version
  employment: "Employment Services",
  business: "Business Services",
  cms: "Commercial Cleaning Services",         // CMS page
  pickup: "Donation Pick‑Up",                  // Pick‑Up page
  donate: "Donate Now",                        // Give/Donate page
  involved: "Get Involved",
  learn: "Learn & Connect",
  carf: "CARF Accreditation",
  thriftstore: "DART Thrift Store",
  shredding: "Secure Document Shredding",
  // (add any other keys from your navTree here)
};

const IntroBar: React.FC<IntroBarProps> = ({ currentPage }) => {
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