"use client";

import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Target, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  SIMPLE MAP PAGE – renders a static world map with hover/click handling   */
/* -------------------------------------------------------------------------- */

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function StrengthMap() {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // Mock country data for immediate rendering (replace with real API later)
  const mockCountries = [
    { code: "US", name: "United States", score: 0.85 },
    { code: "CN", name: "China", score: 0.78 },
    { code: "RU", name: "Russia", score: 0.72 },
    { code: "IN", name: "India", score: 0.65 },
    { code: "GB", name: "United Kingdom", score: 0.60 },
  ];

  // Compute a simple color based on score
  const colorFromScore = (score: number) => {
    const t = Math.min(score, 1);
    const r = Math.round(15 + t * (245 - 15));
    const g = Math.round(23 + (1 - t) * (180 - 23));
    const b = Math.round(42 + (1 - t) * (30 - 42));
    return `rgba(${r},${g},${b},0.8)`;
  };

  // Render a single geography element
  const renderGeography = (geo: any) => {
    const iso = Object.keys(geo).find((k) => geo[k] === geo.id);
    const country = mockCountries.find((c) => c.code === iso);
    const isSelected = selected && selected === iso;
    const isHovered = hovered && hovered === iso;

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        fill={isSelected ? "#fbbf24" : isHovered ? "#fbbf24" : colorFromScore(country?.score ?? 0)}
        stroke={isSelected ? "#fff" : "#0f172a"}
        strokeWidth={isSelected ? 1.5 : 0.5}
        onMouseEnter={() => setHovered(iso)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => setSelected(prev => prev === iso ? null : iso)}
        style={{
          default: {
            outline: "none",
          },
          hover: {
            cursor: "pointer",
          },
        }}
      />
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono uppercase text-primary flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Global Strength Index
            </h1>
            <p className="text-sm text-muted-foreground">
              Hover or click a nation to lock its tactical data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(z * 1.5, 8))} className="h-8 w-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(z / 1.5, 1))} className="h-8 w-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setZoom(1); setCenter([0, 20]); setSelected(null); }} className="h-8 w-8">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Map Container */}
        <div className="relative h-[500px] w-full bg-background rounded-lg overflow-hidden">
          <ComposableMap projectionConfig={{ scale: 140 }}>
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ zoom: z, coordinates }) => {
                setZoom(z);
                setCenter(coordinates as [number, number]);
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) => geographies.map(renderGeography)}
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Fixed Target Profile Card – always visible above map */}
          <div className="absolute bottom-4 left-4 right-4 max-w-md bg-card/50 border border-border/50 rounded-lg p-4 shadow-lg">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FlagIcon code={selected} size={24} />
                  <div className="flex flex-col">
                    <span className="font-bold uppercase tracking-tighter text-sm italic leading-tight">
                      {mockCountries.find(c => c.code === selected)?.name}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-primary">
                      Target Locked
                    </span>
                  </div>
                </div>

                <div className="text-3xl font-black text-primary leading-none">
                  {(() => {
                    const s = mockCountries.find(c => c.code === selected)?.score ?? 0;
                    return (s * 100).toFixed(1);
                  })()}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Target className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-sm font-mono uppercase text-primary">
                    Strength Index
                  </span>
                </div>

                {/* Simple progress bar */}
                <div className="mt-2 h-2 w-full bg-muted rounded-none overflow-hidden">
                  <div
                    className="h-2 bg-primary shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-300"
                    style={{ width: `${Math.min((mockCountries.find(c => c.code === selected)?.score ?? 0) * 200, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-mono uppercase text-muted-foreground">
                  No nation selected – hover or click a region
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Simple Instructions */}
        <div className="mt-4 p-3 bg-background/50 rounded-lg border border-border/50">
          <p className="text-sm font-mono text-muted-foreground">
            • Move map to explore • Click a nation to lock its data • Use +/- buttons to zoom
          </p>
        </div>
      </div>
    </Layout>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mock data – replace with real API call when ready                         */
/* -------------------------------------------------------------------------- */
const mockCountries = [
  { code: "US", name: "United States", score: 0.85 },
  { code: "CN", name: "China", score: 0.78 },
  { code: "RU", name: "Russia", score: 0.72 },
  { code: "IN", name: "India", score: 0.65 },
  { code: "GB", name: "United Kingdom", score: 0.60 },
];