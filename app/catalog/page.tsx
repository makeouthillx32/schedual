"use client";

import { useState, useEffect } from "react";

interface Section {
  Section_ID: number;
  Section_Name: string;
}

interface Product {
  Product_ID: number;
  Item: string;
  Price: number;
  Section_ID: number;
}

export default function CatalogPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch all sections from API and remove duplicates
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to load sections");

        const data: Section[] = await res.json();

        // ✅ Ensure only unique sections are added
        const uniqueSections = Array.from(
          new Map(data.map((section) => [section.Section_ID, section])).values()
        );

        setSections(uniqueSections);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingSections(false);
      }
    }

    fetchSections();
  }, []);

  // ✅ Fetch products when a section is selected
  useEffect(() => {
    async function fetchProducts() {
      if (!selectedSection) return;

      setLoadingProducts(true);
      try {
        const res = await fetch(`/api/catalog?sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to load products");

        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProducts();
  }, [selectedSection]);

  return (
    <div>
      {/* Display error if any */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Section Selector */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select a Category:</label>
        {loadingSections ? (
          <p>Loading sections...</p>
        ) : (
          <select
            className="p-2 border rounded w-full"
            value={selectedSection || ""}
            onChange={(e) => setSelectedSection(Number(e.target.value))}
          >
            <option value="">-- Select --</option>
            {sections.map((section) => (
              <option key={section.Section_ID} value={section.Section_ID}>
                {section.Section_Name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Display Products */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Products</h2>
        {loadingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">No products found for this section.</p>
        ) : (
          <ul className="border-t">
            {products.map((product) => (
              <li key={product.Product_ID} className="py-3 border-b">
                <strong>{product.Item}</strong> - ${product.Price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}