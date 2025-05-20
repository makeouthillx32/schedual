"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/app/provider";
import { Building2, Trash2, Plus, MapPin, Clock } from "lucide-react";

interface Business {
  id: number;
  business_name: string;
  address: string;
  before_open: boolean;
}

export default function BusinessManager() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  const [mode, setMode] = useState<"add" | "delete">("add");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [beforeOpen, setBeforeOpen] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/businesses");
      if (!res.ok) throw new Error("Failed to fetch businesses");
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      toast.error("Could not load businesses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Business name is required");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_name: name, address, before_open: beforeOpen }),
      });

      if (!res.ok) throw new Error("Failed to add business");
      
      toast.success("Business added successfully");
      fetchBusinesses();
      setName("");
      setAddress("");
      setBeforeOpen(false);
    } catch (error) {
      toast.error("Failed to add business");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.error("Please select a business to delete");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/businesses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });

      if (!res.ok) throw new Error("Failed to delete business");
      
      toast.success("Business deleted successfully");
      fetchBusinesses();
      setSelectedId(null);
    } catch (error) {
      toast.error("Failed to delete business");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] ${
      isDark 
        ? "bg-[hsl(var(--card))]" 
        : "bg-[hsl(var(--background))]"
    } mt-8`}>
      <h2 className="text-xl font-[var(--font-serif)] font-bold mb-6 flex items-center text-[hsl(var(--foreground))]">
        <Building2 className="mr-2 text-[hsl(var(--sidebar-primary))]" size={20} />
        Business Manager
      </h2>
      
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "add" 
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => setMode("add")}
          disabled={isLoading}
        >
          <Plus size={16} className="mr-1" />
          Add Business
        </button>
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "delete" 
              ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => setMode("delete")}
          disabled={isLoading}
        >
          <Trash2 size={16} className="mr-1" />
          Delete Business
        </button>
      </div>

      {mode === "add" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-name" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              Business Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                <Building2 size={16} />
              </span>
              <input
                id="business-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter business name"
                className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="business-address" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                <MapPin size={16} />
              </span>
              <input
                id="business-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter business address"
                className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 py-1">
            <input
              id="before-open"
              type="checkbox"
              checked={beforeOpen}
              onChange={(e) => setBeforeOpen(e.target.checked)}
              className="h-4 w-4 rounded-sm border-[hsl(var(--border))] text-[hsl(var(--sidebar-primary))] focus:ring-[hsl(var(--sidebar-ring))]"
              disabled={isLoading}
            />
            <label htmlFor="before-open" className="flex items-center text-sm font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              <Clock size={16} className="mr-1 text-[hsl(var(--muted-foreground))]" />
              Clean before opening hours
            </label>
          </div>
          
          <button
            onClick={handleAdd}
            disabled={isLoading || !name.trim()}
            className={`px-6 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium ${
              isLoading || !name.trim() ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? "Adding..." : "Add Business"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="business-select" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              Select Business to Delete
            </label>
            <select
              id="business-select"
              className={`w-full px-4 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5] ${
                !businesses.length ? "opacity-70 cursor-not-allowed" : ""
              }`}
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(parseInt(e.target.value))}
              disabled={isLoading || !businesses.length}
            >
              <option value="">Select a business</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.business_name} - {b.address}
                </option>
              ))}
            </select>
          </div>
          
          {selectedId && (
            <div className={`p-4 rounded-[var(--radius)] ${
              isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
            }`}>
              <p className="text-sm font-[var(--font-sans)] text-[hsl(var(--foreground))] mb-1">
                <span className="font-medium">Are you sure you want to delete:</span>
              </p>
              <p className="text-[hsl(var(--foreground))] font-[var(--font-sans)]">
                {businesses.find(b => b.id === selectedId)?.business_name}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
                {businesses.find(b => b.id === selectedId)?.address}
              </p>
            </div>
          )}
          
          <button
            onClick={handleDelete}
            disabled={isLoading || !selectedId}
            className={`px-6 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--destructive))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium flex items-center justify-center ${
              isLoading || !selectedId ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Trash2 size={16} className="mr-1" />
            {isLoading ? "Deleting..." : "Delete Business"}
          </button>
        </div>
      )}
      
      {businesses.length === 0 && !isLoading && (
        <div className={`mt-4 p-4 rounded-[var(--radius)] text-center ${
          isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
        }`}>
          <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
            No businesses found. Add your first business.
          </p>
        </div>
      )}
    </div>
  );
}