"use client";

import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores, scoreToColor } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping ISO2 → numeric ID for the low-level map library
const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  SA: "682", BR: "076", IT: "380", NO: "578", SE: "752", FI: "246",
  PL: "616", UA: "804", AU: "036", CA: "124", KP: "408", EG: "818",
  ES: "724", MX: "484", DK: "208"
};

export default function MapPage() {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [hovered, setHovered] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const scoredData = useMemo(() => calculateScores(COUNTRIES_DATA), []);

  const countryScores: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    scoredData.forEach(s => {
      const numericId = ISO2_TO_NUMERIC[s.code];
      if (numericId) m[numericId] = s.totalScore;
    });
    return m;
  }, [scoredData]);

  const focusedCountry = useMemo(() => {
    if (selected) {
      const country = COUNTRIES_DATA.find(c => c.code === selected);
      const score = scoredData.find(s => s.code === selected)?.totalScore || 0;
      return {
        name: country?.name,
        score: score,
        code: selected,
        isLocked: true
      };
    }
    return hovered ? { ...hovered, isLocked: false } : null;
  }, [selected, hovered, scoredData]);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-primary" />
              Global Strength Index
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              Geospatial Force Distribution
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card/50 p-2 border border-border/50 backdrop-blur-sm">
            <CountrySelector
              placeholder="Search Intel Database..."
              value={selected || ""}
              onChange={setSelected}
              countries={COUNTRIES_DATA}
              className="w-full sm:w-64"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z * 1.5, 8))} className="h-12 w-12"><ZoomIn className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z / 1.5, 1))} className="h-12 w-12"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" onClick={() => { setZoom(1); setCenter([0, 20]); setSelected(null); }} className="h-12 w-12"><RotateCcw className="w-4 h-4" /></Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden relative min-h-[600px]">
            <ComposableMap projectionConfig={{ scale: 140 }}>
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ coordinates, zoom }) => {
                  setCenter(coordinates as [number, number]);
                  setZoom(zoom);
                }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const score = countryScores[geo.id];
                      const isAdded = score !== undefined;
                      const isSelected = selected && ISO2_TO_NUMERIC[selected] === geo.id;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            const iso = Object.keys(ISO2_TO_NUMERIC).find(k => ISO2_TO_NUMERIC[k] === geo.id);
                            if (iso) {
                              const country = COUNTRIES_DATA.find(c => c.code === iso);
                              setHovered({
                                name: country?.name,
                                score: score || 0,
                                code: iso,
                              });
                            }
                          }}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => {
                            const iso = Object.keys(ISO2_TO_NUMERIC).find(k => ISO2_TO_NUMERIC[k] === geo.id);
                            if (iso) setSelected(iso);
                          }}
                          style={{
                            default: {
                              fill: isSelected ? "#fbbf24" : (isAdded ? scoreToColor(score) : "hsl(var(--muted) / 0.2)"),
                              outline: "none",
                              stroke: isSelected ? "#ffffff" : "#0f172a",
                              strokeWidth: isSelected ? 1 : 0.5,
                            },
                            hover: {
                              fill: isAdded ? "#fbbf24" : "hsl(var(--muted) / 0.4)",
                              outline: "none",
                              cursor: isAdded ? "pointer" : "default",
                              stroke: "#ffffff",
                              strokeWidth: 1,
                            },
                            pressed: {
                              fill: "#f59e0b",
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {focusedCountry && (
              <div className="absolute bottom-4 left-4 bg-card/95 border border-primary/30 p-5 rounded-none shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 max-w-xs w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FlagIcon code={focusedCountry.code} size={28} />
                    <span className="font-black uppercase tracking-tighter text-lg italic">{focusedCountry.name}</span>
                  </div>
                  {focusedCountry.isLocked && (
                    <button 
                      onClick={() => setSelected(null)}
                      className="p-1 hover:text-primary transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-1">Strength Index</div>
                    <div className="text-4xl font-black font-mono text-primary leading-none">{focusedCountry.score.toFixed(2)}</div>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Capabilities Tier</div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted/20">
                        <div 
                          className="h-full bg-primary shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                          style={{ width: `${focusedCountry.score}%` }} 
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary">
                        {focusedCountry.score > 70 ? 'ELITE' : focusedCountry.score > 40 ? 'MAJOR' : 'REGIONAL'}
                      </span>
                    </div>
                  </div>
                  {!focusedCountry.isLocked && (
                    <div className="text-[9px] font-mono text-muted-foreground italic uppercase">
                      Click to lock tactical view
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest">Map Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Index Gradient</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    <span className="text-[10px] font-mono uppercase">Tier 1 (Global Power)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#f59e0b]" />
                    <span className="text-[10px] font-mono uppercase">Tier 2 (Major Regional)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#92400e]" />
                    <span className="text-[10px] font-mono uppercase">Tier 3 (Regional)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 opacity-20 bg-muted border border-white/10" />
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">No Intel / Neutral</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border/50">
                <div className="bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapIcon className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-primary">Instructions</span>
                  </div>
                  <ul className="space-y-2 text-[9px] font-mono uppercase text-muted-foreground leading-relaxed">
                    <li>• Hover over any colored region for quick assessment</li>
                    <li>• Click region to lock tactical data card</li>
                    <li>• Use search bar to locate specific priority targets</li>
                    <li>• Scroll or use controls to adjust operational zoom</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[9px] text-muted-foreground leading-relaxed italic uppercase tracking-tighter opacity-50">
                  Global Force Distribution Visualizer v4.2.0. Real-time rendering based on STRATCOM-6 Unified Dataset.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}