"use client";

import { useState, useEffect } from "react";

export default function ProductCatalog() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [subsections, setSubsections] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data = await res.json();
        setSections(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchSections();
  }, []);

  async function handleSectionChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const sectionId = event.target.value;
    setSelectedSection(sectionId);
    setProducts([]); // Reset products when switching sections

    try {
      // Fetch subsections for the selected section
      const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${sectionId}`);
      if (!res.ok) throw new Error("Failed to fetch subsections");
      const subsectionData = await res.json();
      setSubsections(subsectionData);

      // Fetch all products for this section by retrieving all its subsections' products
      let allProducts = [];
      for (const subsection of subsectionData) {
        const productRes = await fetch(`/api/catalog?getProducts=true&subsectionId=${subsection.Subsection_ID}`);
        if (productRes.ok) {
          const productData = await productRes.json();
          allProducts = [...allProducts, ...productData];
        }
      }
      setProducts(allProducts);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Product Catalog</h1>

      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      <label className="block text-lg font-semibold">Select a Section:</label>
      <select
        className="w-full p-2 border rounded-md mt-2"
        onChange={handleSectionChange}
        defaultValue=""
      >
        <option value="" disabled>-- Select Section --</option>
        {sections.map((section) => (
          <option key={section.Section_ID} value={section.Section_ID}>
            {section.Section_Name}
          </option>
        ))}
      </select>

      <h2 className="text-xl font-semibold mt-4">Subsections:</h2>
      {subsections.length === 0 ? (
        <p className="text-gray-600">No subsections available for this section.</p>
      ) : (
        <ul className="list-disc list-inside">
          {subsections.map((subsection) => (
            <li key={subsection.Subsection_ID}>{subsection.Subsection_Name}</li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-4">Products:</h2>
      {products.length === 0 ? (
        <p className="text-gray-600">No products available for this section.</p>
      ) : (
        <ul className="list-disc list-inside">
          {products.map((product) => (
            <li key={product.Product_ID}>
              {product.Product_Name} - ${product.Price.toFixed(2)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}