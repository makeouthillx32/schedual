"use client";

import React, { useState } from "react";
import Image from "next/image";
import SheetGrid from "@/components/PunchCardGrid";
import DownloadPDF from "@/components/DownloadPDF";

const PunchCardMaker = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("1"); // Default template
  const [numPunchCards, setNumPunchCards] = useState(5);
  const [generated, setGenerated] = useState(false);
  const [sheets, setSheets] = useState<string[]>([]); // Store generated sheets

  const handleGenerate = () => {
    setGenerated(false); // Prevent instant update
    const totalSheets = Math.ceil(numPunchCards / 10); // Max 10 per sheet
    const generatedSheets = [];

    for (let i = 0; i < totalSheets; i++) {
      generatedSheets.push(`/sheets/sheet_${i + 1}.png`); // Placeholder sheet name
    }

    setSheets(generatedSheets);
    setGenerated(true); // Now display generated sheets
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Punch Card Maker</h1>

      {/* Template Selection */}
      <label className="block font-semibold">Select Template:</label>
      <select
        className="border p-2 mb-4"
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
      >
        <option value="1">Template 1</option>
        <option value="2">Template 2</option>
        <option value="3">Template 3</option>
        <option value="4">Template 4</option>
      </select>

      {/* Template Preview */}
      <h2 className="text-lg font-semibold mt-4">Selected Template Preview</h2>
      <div className="border p-4 shadow-lg rounded-lg flex justify-center items-center w-full max-w-lg mx-auto">
        <Image
          src={`/images/${selectedTemplate}.png`} // ✅ Corrected path
          alt="Selected Punch Card Template"
          width={500}
          height={300}
          className="rounded-lg object-contain"
          priority={true}
        />
      </div>

      {/* Number of Punch Cards Input */}
      <label className="block font-semibold mt-4">Number of Punch Cards:</label>
      <input
        type="number"
        className="border p-2 mb-4 w-full"
        value={numPunchCards}
        onChange={(e) => setNumPunchCards(parseInt(e.target.value, 10))}
      />

      {/* Generate Button */}
      <button
        className="p-3 bg-blue-600 text-white rounded"
        onClick={handleGenerate}
      >
        Generate Punch Cards
      </button>

      {/* Render Sheets Grid when Generated */}
      {generated && <SheetGrid sheets={sheets} />}

      {/* PDF Download */}
      {generated && <DownloadPDF sheets={sheets} />}
    </div>
  );
};

export default PunchCardMaker;