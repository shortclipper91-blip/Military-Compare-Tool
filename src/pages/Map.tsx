"use client";

import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores, scoreToColor } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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

  const scoredData = useMemo(() => calculateScores(COUNTRIES_DATA), []);

  const countryScores: Record<string, number> = useMemo(() => {
    const m: Record<string, number> = {};
    scoredData.forEach(s => {
      const numericId = ISO2_TO_NUMERIC[s.code];
      if (numericId) m[numericId] = s.totalScore;
    });
    return m;
  }, [scoredData]);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-primary" />
              Global Strength Index
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">
              Geospatial Force Distribution
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z * 1.5, 8))}><ZoomIn className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z / 1.5, 1))}><ZoomOut className="w-4 h-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => { setZoom(1); setCenter([0, 20]); }}><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3 border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden relative min-h-[500px]">
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
                          style={{
                            default: {
                              fill: isAdded ? scoreToColor(score) : "hsl(var(--muted) / 0.2)",
                              outline: "none",
                              stroke: "#0f172a",
                              strokeWidth: 0.5,
                            },
                            hover: {
                              fill: isAdded ? "#fbbf24" : "hsl(var(--muted) / 0.4)",
                              outline: "none",
                              cursor: isAdded ? "pointer" : "default",
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

            {hovered && (
              <div className="absolute bottom-4 right-4 bg-card/90 border border-primary/20 p-4 rounded-lg shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 mb-2">
                  <FlagIcon code={hovered.code} size={24} />
                  <span className="font-bold uppercase tracking-tighter">{hovered.name}</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Strength Index</div>
                <div className="text-2xl font-black font-mono text-primary">{hovered.score.toFixed(2)}</div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  TIER: {hovered.score > 70 ? 'ELITE' : hovered.score > 40 ? 'MAJOR' : 'REGIONAL'}
                </div>
              </div>
            )}
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#fbbf24] rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 1 (Global Power)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#f59e0b] rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 2 (Major Regional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#92400e] rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 3 (Regional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm opacity-20 bg-muted" />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">Not in Intelligence DB</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic uppercase tracking-tighter">
                  Index calculated from unified military metrics database v4.2.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}