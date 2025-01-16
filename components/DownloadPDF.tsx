"use client";

import React from "react";
import { generatePDF } from "@/utils/pdfGenerator";

interface DownloadPDFProps {
  selectedTemplate: string;
}

const DownloadPDF: React.FC<DownloadPDFProps> = ({ selectedTemplate }) => {
  return (
    <button
      className="mt-6 p-3 bg-green-600 text-white rounded"
      onClick={() => generatePDF(selectedTemplate)} // Pass selectedTemplate explicitly
    >
      Download as PDF
    </button>
  );
};

export default DownloadPDF;