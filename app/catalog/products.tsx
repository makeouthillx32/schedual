"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/provider"; // Import theme context
import { FaPlus, FaTrash, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

// ✅ Define Types
type Section = { Section_ID: number; Section_Name: string };
type Subsection = { Subsection_ID: number; Subsection_Name: string; Parent_Section_ID: number };
type Product = { Product_ID: number; Product_Name: string; Price: number; Sub_Section_ID: number };

export default function Products() {
  const { themeType } = useTheme(); // Get the current theme
  const [sections, setSections] = useState<Section[]>([]);
  const [subsections, setSubsections] = useState<Subsection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"view" | "add">("view");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSections() {
      try {
        setLoading(true);
        const res = await fetch("/api/catalog?getSections=true");
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data: Section[] = await res.json();
        setSections(data);
      } catch (err) {
        console.error("❌ Section Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  useEffect(() => {
    if (!selectedSection) {
      setSubsections([]);
      setProducts([]);
      return;
    }
    async function fetchSubsections() {
      try {
        setLoading(true);
        const res = await fetch(`/api/catalog?getSubsections=true&sectionId=${selectedSection}`);
        if (!res.ok) throw new Error("Failed to fetch subsections");
        const data: Subsection[] = await res.json();
        setSubsections(data);
      } catch (err) {
        console.error("❌ Subsection Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubsections();
  }, [selectedSection]);

  useEffect(() => {
    if (!selectedSubsection) {
      setProducts([]);
      return;
    }
    fetchProducts();
  }, [selectedSubsection]);

  async function fetchProducts() {
    if (!selectedSubsection) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/products?subsectionId=${selectedSubsection}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("❌ Product Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct() {
    if (!selectedSubsection || !productName.trim() || !price.trim()) {
      setMessage("❌ All fields are required.");
      return;
    }
    const payload = { Product_Name: productName, Price: parseFloat(price), Sub_Section_ID: selectedSubsection };
    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Product added: ${data.product.Product_Name}`);
        setProductName("");
        setPrice("");
        fetchProducts();
        setMode("view");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to add product. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveProduct(productId: number) {
    try {
      setLoading(true);
      const response = await fetch(`/api/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Removed product: ${data.deletedProduct.Product_Name}`);
        setProducts(products.filter((p) => p.Product_ID !== productId));
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Failed to remove product. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow bg-card text-card-foreground">
      <h1 className="text-3xl font-bold mb-6 text-card-foreground">Product Management</h1>

      {message && (
        <div className={`p-3 mb-4 rounded-md ${message.includes("✅") ? "bg-green-500 text-green-100" : "bg-red-500 text-red-100"}`}>
          {message}
        </div>
      )}

      <div className="bg-background p-4 rounded-lg shadow-md mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-semibold text-card-foreground mb-2">Section:</label>
            <select className="w-full p-2 border rounded-md bg-background text-foreground" value={selectedSection ?? ""} onChange={(e) => setSelectedSection(e.target.value ? parseInt(e.target.value, 10) : null)}>
              <option value="" disabled>-- Select Section --</option>
              {sections.map((section) => (
                <option key={section.Section_ID} value={section.Section_ID}>
                  {section.Section_Name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-card-foreground mb-2">Subsection:</label>
            <select className="w-full p-2 border rounded-md bg-background text-foreground" value={selectedSubsection ?? ""} onChange={(e) => setSelectedSubsection(e.target.value ? parseInt(e.target.value, 10) : null)}>
              <option value="" disabled>-- Select Subsection --</option>
              {subsections.map((sub) => (
                <option key={sub.Subsection_ID} value={sub.Subsection_ID}>
                  {sub.Subsection_Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedSubsection && (
        <div className="bg-background p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
            <FaEdit className="mr-2 text-blue-500" /> Products in Subsection
          </h2>

          {loading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : products.length > 0 ? (
            <ul className="divide-y">
              {products.map((product) => (
                <li key={product.Product_ID} className="py-3 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-card-foreground">{product.Product_Name}</span>
                    <span className="ml-2 text-muted-foreground">${product.Price.toFixed(2)}</span>
                  </div>
                  <button className="p-2 text-red-400 hover:text-red-600 rounded-full transition-colors" onClick={() => handleRemoveProduct(product.Product_ID)}>
                    <FaTrash />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}