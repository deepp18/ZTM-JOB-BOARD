// src/components/FilterDropdown.tsx
import React, { useEffect, useRef, useState } from "react";

interface FilterPayload {
  cities: string[];
  jobs: string[];
}

interface FilterDropdownProps {
  cities: string[]; // options
  jobs: string[]; // options
  onFilterChange: (filters: FilterPayload) => void; // receives arrays
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ cities, jobs, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // report changes upstream
  useEffect(() => {
    onFilterChange({ cities: selectedCities, jobs: selectedJobs });
  }, [selectedCities, selectedJobs, onFilterChange]);

  function toggleCity(city: string) {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]));
  }

  function toggleJob(job: string) {
    setSelectedJobs((prev) => (prev.includes(job) ? prev.filter((j) => j !== job) : [...prev, job]));
  }

  function clearAll() {
    setSelectedCities([]);
    setSelectedJobs([]);
  }

  const activeCount = selectedCities.length + selectedJobs.length;

  return (
    <div ref={rootRef} style={{ position: "relative", marginRight: "1rem", fontFamily: "inherit" }}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          padding: "0.45rem 0.9rem",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          cursor: "pointer",
          background: "#111",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 600,
        }}
      >
        Filters{activeCount ? ` · ${activeCount}` : ""} <span style={{ fontSize: 11 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filters"
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            background: "#111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: 12,
            zIndex: 1200,
            width: 260,
            color: "#fff",
            boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Cities</div>
            <div style={{ maxHeight: 120, overflow: "auto", paddingRight: 6 }}>
              {cities.map((c) => (
                <label key={c} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(c)}
                    onChange={() => toggleCity(c)}
                    style={{ width: 16, height: 16 }}
                    aria-checked={selectedCities.includes(c)}
                  />
                  <span style={{ fontSize: 14 }}>{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Job Roles</div>
            <div style={{ maxHeight: 120, overflow: "auto", paddingRight: 6 }}>
              {jobs.map((j) => (
                <label key={j} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(j)}
                    onChange={() => toggleJob(j)}
                    style={{ width: 16, height: 16 }}
                    aria-checked={selectedJobs.includes(j)}
                  />
                  <span style={{ fontSize: 14 }}>{j}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <button
              type="button"
              onClick={clearAll}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#ddd",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Clear
            </button>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#4aa3f0",
                  border: "none",
                  color: "#071226",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
  