"use client";

import { useState } from "react";
import Products from "./products"; // Import the combined Products component
import SubsectionManager from "./subsection"; // Import the Subsection Manager component
import SectionManager from "./section"; // Import the Section Manager component

export default function ProductManager() {
  const [showProducts, setShowProducts] = useState(false);
  const [showSubsectionManager, setShowSubsectionManager] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Product Manager</h1>

      {/* ✅ Toggle Product Management (Add & Remove) */}
      <button
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 mb-2"
        onClick={() => setShowProducts(!showProducts)}
      >
        {showProducts ? "Close Product Management" : "Manage Products"}
      </button>

      {/* ✅ Toggle Subsection Manager Component */}
      <button
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-700 mb-2"
        onClick={() => setShowSubsectionManager(!showSubsectionManager)}
      >
        {showSubsectionManager ? "Close Subsection Manager" : "Manage Subsections"}
      </button>

      {/* ✅ Toggle Section Manager Component */}
      <button
        className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-700"
        onClick={() => setShowSectionManager(!showSectionManager)}
      >
        {showSectionManager ? "Close Section Manager" : "Manage Sections"}
      </button>

      {/* ✅ Render Components Conditionally */}
      {showProducts && <Products />}
      {showSubsectionManager && <SubsectionManager />}
      {showSectionManager && <SectionManager />}
    </div>
  );
}
