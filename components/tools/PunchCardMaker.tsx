"use client";

import React, { useState } from "react";
import PunchCardGrid from "../PunchCardGrid";
import DownloadPDF from "../DownloadPDF";
import { Providers, useTheme } from "@/app/provider";

// Available punch card templates
const templates = ["1.png", "2.png", "3.png", "4.png", "5.png"];

const PunchCardMaker: React.FC = () => {
  const [numPunchCards, setNumPunchCards] = useState<number>(5);
  const [generated, setGenerated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0]); // Default template
  const { themeType } = useTheme();

  return (
    <Providers>
      <div
        className={`p-6 min-h-screen ${
          themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4">Punch Card Maker</h1>

        {/* Template Selection Dropdown */}
        <div className="mb-4">
          <label className="block mb-2 font-bold">Select Template:</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="p-2 border rounded w-full text-black"
          >
            {templates.map((template, index) => (
              <option key={index} value={template}>
                Template {index + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Number of Punch Cards */}
        <div className="mb-4">
          <label className="block mb-2 font-bold">Number of Punch Cards:</label>
          <input
            type="number"
            value={numPunchCards}
            onChange={(e) => setNumPunchCards(Number(e.target.value))}
            className="p-2 border rounded w-full text-black"
            min={1}
          />
        </div>

        {/* Generate Punch Cards Button */}
        <button
          className="p-3 bg-blue-600 text-white rounded"
          onClick={() => setGenerated(true)}
        >
          Generate Punch Cards
        </button>

        {/* Display Generated Punch Cards */}
        {generated && <PunchCardGrid numPunchCards={numPunchCards} selectedTemplate={selectedTemplate} />}
        
        {/* PDF Download Button */}
        {generated && <DownloadPDF selectedTemplate={selectedTemplate} />}
      </div>
    </Providers>
  );
};

export default PunchCardMaker;