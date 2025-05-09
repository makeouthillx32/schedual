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
  careers: "Careers",
  jobs: "Jobs",
  programs: "Programs & Services",
  transportation: "Transportation",
  "early-childhood": "Early Childhood Services",
  "supported-living": "Supported Living Services",
  artists: "Artists on the Edge",
  AutismDayCamp: "Autism Day Camp",               // <-- changed key
  employment: "Employment Services",
  business: "Business Services",
  CMSPage: "Commercial Cleaning Services",       // <-- changed key
  pickup: "Donation Pick‑Up",
  donate: "Donate Now",
  involved: "Get Involved",
  learn: "Learn & Connect",
  carf: "CARF Accreditation",
  thriftstore: "DART Thrift Store",
  shredding: "Secure Document Shredding",
  // add any other pages here...
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