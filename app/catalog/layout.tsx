"use client";

import { useState, useEffect } from "react";

interface Product {
  Product_ID: number;
  Item: string;
  Price: number;
  Section_ID: number;
  Subcategory_ID: number;
}

export default function CatalogLayout() {
  const [categories] = useState([
    { id: 1, name: "Housewares" },
    { id: 2, name: "Electronics" },
    { id: 3, name: "Clothing" },
  ]); // Example categories
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (selectedCategory === null) return;

      try {
        const res = await fetch(`/api/catalog?sectionId=${selectedCategory}`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">Product Catalog</h1>

      {/* Category Selector */}
      <label className="block mt-4 font-semibold">Select a Category:</label>
      <select
        className="p-2 border rounded"
        value={selectedCategory || ""}
        onChange={(e) => setSelectedCategory(Number(e.target.value))}
      >
        <option value="">-- Select --</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Display Products */}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="mt-4">
        {products.map((product) => (
          <li key={product.Product_ID} className="border-b py-2">
            {product.Item} - ${product.Price}
          </li>
        ))}
      </ul>
    </div>
  );
}