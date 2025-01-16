"use client";

import React, { useState } from "react";
import Image from "next/image";
import PunchCardGrid from "@/components/PunchCardGrid";
import DownloadPDF from "@/components/DownloadPDF";

const PunchCardMaker = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("template1.png");
  const [numPunchCards, setNumPunchCards] = useState(5);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
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
        <option value="template1.png">Template 1</option>
        <option value="template2.png">Template 2</option>
        <option value="template3.png">Template 3</option>
        <option value="template4.png">Template 4</option>
        <option value="template5.png">Template 5</option>
      </select>

      {/* Template Preview */}
      <h2 className="text-lg font-semibold mt-4">Selected Template Preview</h2>
      <div className="border p-4 shadow-lg rounded-lg w-[500px] h-[300px] flex justify-center items-center">
        <Image
          src={`/images/${selectedTemplate}`} // ✅ Ensure correct path
          alt="Selected Punch Card Template"
          width={500}
          height={300}
          className="rounded-lg"
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

      {/* Render Punch Cards Grid when Generated */}
      {generated && (
        <>
          <PunchCardGrid numPunchCards={numPunchCards} selectedTemplate={selectedTemplate} />
          <DownloadPDF selectedTemplate={selectedTemplate} numPunchCards={numPunchCards} />
        </>
      )}
    </div>
  );
};

export default PunchCardMaker;