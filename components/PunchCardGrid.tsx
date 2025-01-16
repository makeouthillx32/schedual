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
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: numPunchCards }, (_, index) => (
            <div key={index} className="border p-2 bg-gray-100 flex justify-center items-center">
              <Image
                src={`/images/${selectedTemplate}`}
                alt={`Punch Card ${index + 1}`}
                width={400}
                height={250}
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