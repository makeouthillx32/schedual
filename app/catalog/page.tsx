"use client";

import { useState, useEffect } from "react";

interface Section {
  Section_ID: number;
  Section_Name: string;
}

interface Subcategory {
  Subcategory_ID: number;
  Subcategory_Name: string;
}

export default function CatalogPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch unique sections
  useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to load sections");

        const data: Section[] = await res.json();

        console.log("API Sections Response:", data); // 🔍 Debug log

        // ✅ Ensure only unique sections are stored
        const uniqueSections = Array.from(
          new Map(data.map((s) => [s.Section_ID, s])).values()
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

  // ✅ Fetch subcategories when a section is selected
  useEffect(() => {
    async function fetchSubcategories() {
      if (!selectedSection) return;

      setLoadingSubcategories(true);
      try {
        const res = await fetch(`/api/catalog?getSubcategories=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to load subcategories");

        const data: Subcategory[] = await res.json();

        console.log("API Subcategories Response:", data); // 🔍 Debug log

        setSubcategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingSubcategories(false);
      }
    }

    fetchSubcategories();
  }, [selectedSection]);

  return (
    <div>
      {/* Display error if any */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Section Selector */}
      <div className="mb-6">
        <label className="block font-semibold mb-2">Select a Section:</label>
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

      {/* Display Subcategory Count */}
      {selectedSection && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Subcategories</h2>
          {loadingSubcategories ? (
            <p>Loading subcategories...</p>
          ) : (
            <p className="text-gray-700">
              This section has <strong>{subcategories.length}</strong> subcategories.
            </p>
          )}
        </div>
      )}
    </div>
  );
}