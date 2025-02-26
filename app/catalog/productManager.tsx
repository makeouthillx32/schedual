"use client";

import { useState } from "react";
import AddProduct from "./add"; // Import the Add Product component

export default function ProductManager() {
  const [showAddProduct, setShowAddProduct] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Product Manager</h1>

      {/* Toggle Add Product Component */}
      <button
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={() => setShowAddProduct(!showAddProduct)}
      >
        {showAddProduct ? "Close Add Product" : "Add Product"}
      </button>

      {/* Show Add Product Form if Button is Clicked */}
      {showAddProduct && <AddProduct />}
    </div>
  );
}