"use client";

interface IntroBarProps {
  currentPage: string;
}

const labels: Record<string, string> = {
  about: "About Us",
  board: "Board of Directors",
  title9: "Title 9 Information",
  action: "Autism Day Camp",
  jobs: "Jobs",
  transportation: "Transportation",
  earlychildhood: "Early Childhood Services",
  supportedliving: "Supported Living Services",
  artists: "Artists on the Edge",
  employment: "Employment Services",
  carf: "Commission for the Accreditation of Rehabilitation Facilities",
  thrift: "DART Thrift Store",
  shredding: "Secure Document Shredding",
  programs: "Programs & Services",
  business: "Business Services",
  involved: "Get Involved",
  learn: "Learn & Connect",
};

const IntroBar: React.FC<IntroBarProps> = ({ currentPage }) => {
  if (!labels[currentPage]) return null;
  return (
    <div className="bg-blue-500 h-12 md:h-16 flex items-center justify-center">
      <div className="intro-bar-text text-white text-xl md:text-2xl font-semibold">
        {labels[currentPage]}
      </div>
    </div>
  );
};

export default IntroBar;