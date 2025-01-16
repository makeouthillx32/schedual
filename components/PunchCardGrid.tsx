"use client";

import React from "react";
import Image from "next/image";

interface PunchCardGridProps {
  punchCards?: string[]; // Array of individual punch card images
  sheets?: string[]; // Array of full sheet images
}

const PunchCardGrid: React.FC<PunchCardGridProps> = ({ punchCards, sheets }) => {
  return (
    <div className="flex flex-col items-center mt-6">
      {/* Render Sheets if Available */}
      {sheets && sheets.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Generated Sheets</h2>
          <div className="grid grid-cols-1 gap-6">
            {sheets.map((sheet, index) => (
              <div
                key={index}
                className="relative w-[816px] h-[1056px] border shadow-lg overflow-hidden flex justify-center items-center"
              >
                <Image
                  src={sheet}
                  alt={`Sheet ${index + 1}`}
                  width={816}
                  height={1056}
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        // Fallback: Render individual punch cards if no sheets exist
        <>
          <h2 className="text-xl font-semibold mb-4">Generated Punch Cards</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {punchCards?.map((card, index) => (
              <div
                key={index}
                className="relative w-[250px] h-[150px] border shadow-md overflow-hidden flex justify-center items-center"
              >
                <Image
                  src={card}
                  alt={`Card #${index + 1}`}
                  width={250}
                  height={150}
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PunchCardGrid;