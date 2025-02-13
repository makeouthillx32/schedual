"use client";

import { useState } from "react";

export default function ProductManager() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [subsectionId, setSubsectionId] = useState("");
  const [message, setMessage] = useState("");

  const handleAddProduct = async () => {
    if (!productName || !price || !subsectionId) {
      setMessage("All fields are required.");
      return;
    }

    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Product_Name: productName,
        Price: parseFloat(price),
        Sub_Section_ID: parseInt(subsectionId, 10),
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(`Product added: ${data.product.Product_Name}`);
      setProductName("");
      setPrice("");
      setSubsectionId("");
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Product Manager</h1>

      {message && <p className="mb-4 text-red-500">{message}</p>}

      <input
        className="w-full p-2 border rounded mb-2"
        type="text"
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded mb-2"
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded mb-2"
        type="number"
        placeholder="Subsection ID"
        value={subsectionId}
        onChange={(e) => setSubsectionId(e.target.value)}
      />

      <button
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        onClick={handleAddProduct}
      >
        Add Product
      </button>
    </div>
  );
}