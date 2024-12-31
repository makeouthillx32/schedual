import React from "react";

interface RandomizerButtonProps {
  onClick: () => void;
}

const RandomizerButton: React.FC<RandomizerButtonProps> = ({ onClick }) => (
  <button onClick={onClick} className="p-2 bg-blue-500 text-white rounded">
    Randomize Jobs
  </button>
);

export default RandomizerButton;
