"use client";

import React, { useState } from "react";
import { generateIndividualPunchCards } from "@/utils/generate_individual_punchcards";
import { createCompositePages } from "@/utils/create_composite_image";
import { generatePDF } from "@/utils/pdfGenerator";

interface DownloadPDFProps {
  selectedTemplate: string;
  numPunchCards: number;
}

const DownloadPDF: React.FC<DownloadPDFProps> = ({
  selectedTemplate,
  numPunchCards,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const individualCards = await generateIndividualPunchCards(
      selectedTemplate,
      numPunchCards
    );
    const compositePages = await createCompositePages(individualCards);
    await generatePDF(compositePages);
    setLoading(false);
  };

  return (
    <button
      className="mt-6 p-3 bg-green-600 text-white rounded"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? "Generating..." : "Download as PDF"}
    </button>
  );
};

export default DownloadPDF;