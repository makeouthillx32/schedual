"use client";
import { useState, useEffect } from "react";

// Explicitly define the data types
type Section = {
  Section_ID: number;
  Section_Name: string;
};

type Subsection = {
  Subsection_ID: number;
  Subsection_Name: string;
  Parent_Section_ID: number;
};

type Product = {
  Product_ID: number;
  Item: string;
  Price: number;
  Subsection_ID: number;
};

export default function CatalogPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/catalog?getSections=true`);
        if (!response.ok) throw new Error("Failed to fetch sections");

        const data: Section[] = await response.json();
        setSections(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection === null) return;

    const fetchSubsectionsAndProducts = async () => {
      setLoading(true);
      try {
        const [subsectionsRes, productsRes] = await Promise.all([
          fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`),
          fetch(`/api/catalog?getProductsBySection=true&sectionId=${selectedSection}`)
        ]);

        if (!subsectionsRes.ok) throw new Error("Failed to fetch subsections");
        if (!productsRes.ok) throw new Error("Failed to fetch products");

        const subsectionsData: Subsection[] = await subsectionsRes.json();
        const productsData: Product[] = await productsRes.json();

        setSubsections(subsectionsData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSubsectionsAndProducts();
  }, [selectedSection]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Product Catalog</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Section Selector */}
      <label className="block font-semibold mb-1">Select a Section:</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedSection ?? ""}
        onChange={(e) => {
          const selectedValue = e.target.value ? parseInt(e.target.value, 10) : null;
          setSelectedSection(selectedValue);
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

      {/* Subsections & Products */}
      {selectedSection !== null && (
        <>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Subsections:</h2>
          {loading ? (
            <p>Loading...</p>
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