"use client";

import React, { useState } from "react";
import PunchCardGrid from "../PunchCardGrid";
import DownloadPDF from "../DownloadPDF";
import { Providers, useTheme } from "@/app/provider";

const PunchCardMaker: React.FC = () => {
  const [numPunchCards, setNumPunchCards] = useState<number>(5);
  const [generated, setGenerated] = useState(false);
  const { themeType } = useTheme(); // Get the current theme

  return (
    <Providers>
      <div
        className={`p-6 min-h-screen ${
          themeType === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
        }`}
      >
        <h1 className="text-2xl font-bold mb-4">Punch Card Maker</h1>

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

        <button
          className="p-3 bg-blue-600 text-white rounded"
          onClick={() => setGenerated(true)}
        >
          Generate Punch Cards
        </button>

        {generated && <PunchCardGrid numPunchCards={numPunchCards} />}
        {generated && <DownloadPDF />}
      </div>
    </Providers>
  );
};

export default PunchCardMaker;