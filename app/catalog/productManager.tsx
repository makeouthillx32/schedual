"use client";

import { useState } from "react";
import AddProduct from "./add"; // Import Add Product Component
import RemoveProduct from "./remove"; // Import Remove Product Component

export default function ProductManager() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showRemoveProduct, setShowRemoveProduct] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Product Manager</h1>

      {/* ✅ Toggle Add Product Component */}
      <button
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-700 transition mb-2"
        onClick={() => {
          setShowAddProduct(!showAddProduct);
          setShowRemoveProduct(false); // Close Remove Product if open
        }}
      >
        {showAddProduct ? "Close Add Product" : "Add Product"}
      </button>

      {/* ✅ Show Add Product Form if Button is Clicked */}
      {showAddProduct && (
        <div className="mt-4">
          <AddProduct />
        </div>
      )}

      {/* ✅ Toggle Remove Product Component */}
      <button
        className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-700 transition mb-2"
        onClick={() => {
          setShowRemoveProduct(!showRemoveProduct);
          setShowAddProduct(false); // Close Add Product if open
        }}
      >
        {showRemoveProduct ? "Close Remove Product" : "Remove Product"}
      </button>

      {/* ✅ Show Remove Product Form if Button is Clicked */}
      {showRemoveProduct && (
        <div className="mt-4">
          <RemoveProduct />
        </div>
      )}
    </div>
  );
}