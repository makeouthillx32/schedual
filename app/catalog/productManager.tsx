"use client";

import { useState, useEffect } from "react";

type Section = {
  Section_ID: number;
  Section_Name: string;
};

type Subsection = {
  Sub_Section_ID: number;
  Sub_Section_Name: string;
  Parent_Section_ID: number;
};

export default function ProductManager() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  /** ✅ Fetch Sections **/
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        setSections(data);
      } catch (err) {
        console.error("❌ Section Fetch Error:", err);
        setMessage("❌ Failed to load sections.");
      }
    }
    fetchSections();
  }, []);

  /** ✅ Fetch Subsections when Section is selected **/
  useEffect(() => {
    if (!selectedSection) {
      setSubsections([]); // Reset subsections if no section is selected
      return;
    }

    async function fetchSubsections() {
      try {
        const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to fetch subsections");
        const data: Subsection[] = await res.json();
        setSubsections(data);
        setSelectedSubsection(null); // Reset selected subsection
      } catch (err) {
        console.error("❌ Subsection Fetch Error:", err);
        setMessage("❌ Failed to load subsections.");
      }
    }

    fetchSubsections();
  }, [selectedSection]);

  /** ✅ Handle Product Addition **/
  async function handleAddProduct() {
    if (!selectedSubsection || !productName.trim() || !price.trim()) {
      setMessage("❌ All fields are required.");
      return;
    }

    const payload = {
      Product_Name: productName.trim(),
      Price: parseFloat(price),
      Sub_Section_ID: selectedSubsection,
    };

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(`❌ Error: ${data.error}`);
        return;
      }

      setMessage(`✅ Product added: ${data.product.Product_Name}`);
      setProductName("");
      setPrice("");
      setSelectedSubsection(null);
    } catch (error) {
      setMessage("❌ Failed to add product. Try again.");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Product Manager</h1>

      {message && <p className="mb-4 text-red-500">{message}</p>}

      {/* ✅ Select Section */}
      <label className="block text-lg font-semibold">Select a Section:</label>
      <select
        className="w-full p-2 border rounded-md mt-2"
        value={selectedSection ?? ""}
        onChange={(e) => setSelectedSection(e.target.value ? parseInt(e.target.value, 10) : null)}
      >
        <option value="" disabled>-- Select Section --</option>
        {sections.map((section) => (
          <option key={section.Section_ID} value={section.Section_ID}>
            {section.Section_Name}
          </option>
        ))}
      </select>

      {/* ✅ Select Subsection */}
      {subsections.length > 0 ? (
        <>
          <label className="block text-lg font-semibold mt-4">Select a Subsection:</label>
          <select
            className="w-full p-2 border rounded-md mt-2"
            value={selectedSubsection ?? ""}
            onChange={(e) => setSelectedSubsection(e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="" disabled>-- Select Subsection --</option>
            {subsections.map((sub) => (
              <option key={sub.Sub_Section_ID} value={sub.Sub_Section_ID}>
                {sub.Sub_Section_Name}
              </option>
            ))}
          </select>
        </>
      ) : (
        selectedSection && <p className="text-gray-600 mt-4">⚠️ No subsections found for this section.</p>
      )}

      {/* ✅ Product Input Fields */}
      {selectedSubsection && (
        <>
          <label className="block text-lg font-semibold mt-4">Product Name:</label>
          <input
            className="w-full p-2 border rounded mt-2"
            type="text"
            placeholder="Enter product name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />

          <label className="block text-lg font-semibold mt-4">Price:</label>
          <input
            className="w-full p-2 border rounded mt-2"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <button
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-700 mt-4"
            onClick={handleAddProduct}
          >
            Add Product
          </button>
        </>
      )}
    </div>
  );
}