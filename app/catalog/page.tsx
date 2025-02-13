"use client";
import { useState, useEffect } from "react";

export default function CatalogPage() {
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch all Main Sections
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/catalog?getSections=true`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch sections");
        setSections(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    // Fetch Subsections + Products when a Section is selected
    if (!selectedSection) return;

    const fetchSubsectionsAndProducts = async () => {
      setLoading(true);
      try {
        const [subsectionsRes, productsRes] = await Promise.all([
          fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`),
          fetch(`/api/catalog?getProductsBySection=true&sectionId=${selectedSection}`)
        ]);

        const subsectionsData = await subsectionsRes.json();
        const productsData = await productsRes.json();

        if (!subsectionsRes.ok) throw new Error(subsectionsData.error || "Failed to fetch subsections");
        if (!productsRes.ok) throw new Error(productsData.error || "Failed to fetch products");

        setSubsections(subsectionsData);
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubsectionsAndProducts();
  }, [selectedSection]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>

      {/* Display Errors */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Main Section Selector */}
      <label className="block font-semibold mb-1">Select a Section:</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedSection}
        onChange={(e) => {
          setSelectedSection(e.target.value);
          setSubsections([]);
          setProducts([]);
        }}
      >
        <option value="">-- Select Section --</option>
        {sections.map((section) => (
          <option key={section.Section_ID} value={section.Section_ID}>
            {section.Section_Name}
          </option>
        ))}
      </select>

      {/* Subsections & Products (Displays Automatically) */}
      {selectedSection && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Subsections:</h2>
          {loading ? (
            <p>Loading subsections and products...</p>
          ) : (
            <div>
              {subsections.length > 0 ? (
                subsections.map((sub) => (
                  <div key={sub.Subsection_ID} className="mb-4 p-4 border rounded">
                    <h3 className="text-lg font-semibold">{sub.Subsection_Name}</h3>
                    <ul className="mt-2">
                      {products
                        .filter((product) => product.Subsection_ID === sub.Subsection_ID)
                        .map((product) => (
                          <li key={product.Product_ID} className="border-b py-2">
                            <strong>{product.Item}</strong> - ${product.Price.toFixed(2)}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p>No subsections available for this section.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}