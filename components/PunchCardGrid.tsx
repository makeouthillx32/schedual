"use client";

import React from "react";
import Image from "next/image";

interface PunchCardGridProps {
  numPunchCards: number;
  selectedTemplate: string;
}

const PunchCardGrid: React.FC<PunchCardGridProps> = ({ numPunchCards, selectedTemplate }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="border p-4 shadow-md bg-white max-w-[816px] w-full">
        {/* Ensure grid fits punch cards properly */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: numPunchCards }, (_, index) => (
            <div
              key={index}
              className="relative w-[384px] h-[240px] border shadow-lg overflow-hidden"
            >
              <Image
                src={`/images/${selectedTemplate}`}
                alt={`Punch Card ${index + 1}`}
                layout="fill" // Make the image fill the div
                objectFit="cover" // Ensure it stretches to fit
                className="rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PunchCardGrid;