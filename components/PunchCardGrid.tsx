"use client";

import React from "react";
import Image from "next/image";

interface PunchCardGridProps {
  numPunchCards: number;
}

const PunchCardGrid: React.FC<PunchCardGridProps> = ({ numPunchCards }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: numPunchCards }, (_, index) => (
        <div key={index} className="p-4 border bg-white shadow-md">
          <Image
            src={`/app/images/${index + 1}.png`} // Adjusted to match your structure
            alt={`Punch Card ${index + 1}`}
            width={400}
            height={300}
            className="w-full"
          />
          <p className="text-center font-bold mt-2">Card #{index + 1}</p>
        </div>
      ))}
    </div>
  );
};

export default PunchCardGrid;