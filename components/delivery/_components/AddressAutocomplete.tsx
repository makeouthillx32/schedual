// components/delivery/_components/AddressAutocomplete.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn }   from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

// Store proximity — Ridgecrest, CA  (updated in app_settings)
const STORE_LNG = -117.6651;
const STORE_LAT =  35.6297;

interface Suggestion {
  place_name: string; // full formatted address
  text:       string; // short name
}

interface AddressAutocompleteProps {
  label?:       string;
  placeholder?: string;
  value:        string;
  onChange:     (value: string) => void;
  required?:    boolean;
  autoFocus?:   boolean;
  className?:   string;
}

export function AddressAutocomplete({
  placeholder = "Start typing an address…",
  value,
  onChange,
  autoFocus = false,
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery]           = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]       = useState(false);
  const [open, setOpen]             = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef                = useRef<HTMLDivElement>(null);

  // Keep local query in sync when parent resets the value (e.g. new order)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fetch suggestions from Mapbox Geocoding API
  const fetchSuggestions = useCallback(async (q: string) => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || q.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const encoded = encodeURIComponent(q);
      const url = [
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`,
        `?access_token=${token}`,
        `&country=US`,
        `&proximity=${STORE_LNG},${STORE_LAT}`, // bias results to Ridgecrest
        `&types=address`,
        `&limit=5`,
      ].join("");

      const res  = await fetch(url);
      const data = await res.json();
      const hits: Suggestion[] = (data.features ?? []).map((f: { place_name: string; text: string }) => ({
        place_name: f.place_name,
        text:       f.text,
      }));
      setSuggestions(hits);
      setOpen(hits.length > 0);
      setActiveIdx(-1);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input → fetch
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q); // keep parent in sync as they type

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 280);
  };

  // Pick a suggestion
  const handleSelect = (s: Suggestion) => {
    // Strip the country suffix — Mapbox returns "123 Main St, Ridgecrest, California 93555, United States"
    const clean = s.place_name
      .replace(/, United States$/, "")
      .replace(/, USA$/, "");
    setQuery(clean);
    onChange(clean);
    setSuggestions([]);
    setOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Input
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className={cn("h-14 text-base rounded-2xl pr-10", className)}
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
        {/* Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {loading
            ? <Loader2 size={16} className="animate-spin" />
            : <MapPin size={16} />
          }
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_name}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={cn(
                "flex items-start gap-3 px-4 py-3 cursor-pointer text-sm transition-colors",
                i === activeIdx
                  ? "bg-[hsl(var(--sidebar-primary)/0.1)] text-[hsl(var(--sidebar-primary))]"
                  : "hover:bg-muted text-foreground",
              )}
            >
              <MapPin size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                {/* Bold the street part, muted the city/state */}
                <p className="font-semibold leading-tight truncate">{s.text}</p>
                <p className="text-xs text-muted-foreground truncate">{s.place_name}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}