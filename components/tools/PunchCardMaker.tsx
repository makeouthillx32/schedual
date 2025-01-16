"use client";

import React, { useState } from "react";
import PunchCardGrid from "@/components/PunchCardGrid";
import DownloadPDF from "@/components/DownloadPDF";

const PunchCardMaker: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("1.png");
  const [numPunchCards, setNumPunchCards] = useState(5);
  const [generated, setGenerated] = useState(false);
  const [punchCards, setPunchCards] = useState<string[]>([]);
  const [sheets, setSheets] = useState<string[]>([]);

  // Function to handle template change
  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTemplate(event.target.value);
  };

  // Function to generate punch cards
  const handleGenerate = () => {
    const newPunchCards = Array.from({ length: numPunchCards }, (_, i) => `/punchcards/${selectedTemplate}`);
    setPunchCards(newPunchCards);
    setGenerated(true);

    // Simulate sheet generation (2 columns, 5 rows per sheet)
    const sheetCount = Math.ceil(numPunchCards / 10);
    const newSheets = Array.from({ length: sheetCount }, (_, i) => `/sheets/sheet_${i + 1}.png`);
    setSheets(newSheets);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Punch Card Maker</h1>

      {/* Template Selector */}
      <label className="text-lg font-semibold mb-2">Select Template:</label>
      <select className="p-2 border rounded" value={selectedTemplate} onChange={handleTemplateChange}>
        <option value="1.png">Template 1</option>
        <option value="2.png">Template 2</option>
        <option value="3.png">Template 3</option>
        <option value="4.png">Template 4</option>
      </select>

      {/* Number of Punch Cards Input */}
      <label className="text-lg font-semibold mt-4 mb-2">Number of Punch Cards:</label>
      <input
        type="number"
        className="p-2 border rounded w-20 text-center"
        value={numPunchCards}
        onChange={(e) => setNumPunchCards(Number(e.target.value))}
      />

      {/* Generate Button */}
      <button className="mt-4 p-3 bg-blue-600 text-white rounded" onClick={handleGenerate}>
        Generate Punch Cards
      </button>

      {/* Grid for Generated Sheets */}
      {generated && <PunchCardGrid punchCards={punchCards} sheets={sheets} />}

      {/* PDF Download Button */}
      {generated && <DownloadPDF sheets={sheets} />}
    </div>
  );
};

export default PunchCardMaker;