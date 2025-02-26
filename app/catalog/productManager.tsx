"use client";

import { useState } from "react";
import AddProduct from "./add"; // Import the Add Product component
import RemoveProduct from "./remove"; // Import the Remove Product component
import SubsectionManager from "./subsection"; // Import the Subsection Manager component

export default function ProductManager() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showRemoveProduct, setShowRemoveProduct] = useState(false);
  const [showSubsectionManager, setShowSubsectionManager] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Product Manager</h1>

      {/* ✅ Toggle Add Product Component */}
      <button
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 mb-2"
        onClick={() => setShowAddProduct(!showAddProduct)}
      >
        {showAddProduct ? "Close Add Product" : "Add Product"}
      </button>

      {/* ✅ Toggle Remove Product Component */}
      <button
        className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-700 mb-2"
        onClick={() => setShowRemoveProduct(!showRemoveProduct)}
      >
        {showRemoveProduct ? "Close Remove Product" : "Remove Product"}
      </button>

      {/* ✅ Toggle Subsection Manager Component */}
      <button
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-700"
        onClick={() => setShowSubsectionManager(!showSubsectionManager)}
      >
        {showSubsectionManager ? "Close Subsection Manager" : "Manage Subsections"}
      </button>

      {/* ✅ Render Components Conditionally */}
      {showAddProduct && <AddProduct />}
      {showRemoveProduct && <RemoveProduct />}
      {showSubsectionManager && <SubsectionManager />}
    </div>
  );
}