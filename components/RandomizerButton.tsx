"use client";

import React from "react";

interface RandomizerButtonProps {
  onClick: () => void;
}

const RandomizerButton: React.FC<RandomizerButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded"
    style={{
      backgroundColor: "var(--button1-background)",
      color: "var(--button1-foreground)",
    }}
  >
    Randomize Jobs
  </button>
);

export default RandomizerButton;
