"use client";

import React, { useState } from "react";
import PunchCardGrid from "../PunchCardGrid";
import DownloadPDF from "../DownloadPDF";

const PunchCardMaker: React.FC = () => {
  const [numPunchCards, setNumPunchCards] = useState<number>(5);
  const [generated, setGenerated] = useState(false);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Punch Card Maker</h1>

      <div className="mb-4">
        <label className="block mb-2 font-bold">Number of Punch Cards:</label>
        <input
          type="number"
          value={numPunchCards}
          onChange={(e) => setNumPunchCards(Number(e.target.value))}
          className="p-2 border rounded w-full"
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
  );
};

export default PunchCardMaker;