"use client";

import React from "react";
import { generatePDF } from "@/utils/pdfGenerator";

const DownloadPDF: React.FC = () => {
  return (
    <button
      className="mt-6 p-3 bg-green-600 text-white rounded"
      onClick={generatePDF}
    >
      Download as PDF
    </button>
  );
};

export default DownloadPDF;