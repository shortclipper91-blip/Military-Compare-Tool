"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { Card } from "@/components/ui/card";
import { FlagIcon } from "@/components/flag-icon";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive mapping for all countries in our dataset
const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  BR: "076", IT: "380", EG: "818", SA: "682", AU: "036", CA: "124",
  UA: "804", PL: "616", KP: "408"
};

export default function MapPage() {
  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const [hovered, setHovered] = useState<any>(null);

  const getColor = (score: number) => {
    if (score > 80) return "hsl(var(--primary))";
    if (score > 50) return "hsl(var(--primary) / 0.6)";
    if (score > 20) return "hsl(var(--primary) / 0.3)";
    return "hsl(var(--muted) / 0.4)";
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Global Strength Map</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Geospatial Power Distribution Index</p>
        </header>

        <Card className="border-border/50 bg-card/30 overflow-hidden relative min-h-[600px]">
          <ComposableMap projectionConfig={{ scale: 147 }}>
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryCode = Object.keys(ISO2_TO_NUMERIC).find(key => ISO2_TO_NUMERIC[key] === geo.id);
                    const score = scores.find(s => s.code === countryCode);
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => countryCode && setHovered(scores.find(s => s.code === countryCode))}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          default: { 
                            fill: score ? getColor(score.totalScore) : "hsl(var(--muted) / 0.1)", 
                            outline: "none", 
                            stroke: "hsl(var(--border))", 
                            strokeWidth: 0.5 
                          },
                          hover: { 
                            fill: score ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.3)", 
                            outline: "none",
                            cursor: score ? "pointer" : "default"
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {hovered && (
            <div className="absolute bottom-6 right-6 bg-card border border-border p-4 rounded shadow-xl animate-in fade-in slide-in-from-bottom-2 z-50">
              <div className="flex items-center gap-3 mb-2">
                <FlagIcon code={hovered.code} size={20} />
                <span className="font-bold uppercase tracking-tighter">
                  {COUNTRIES_DATA.find(c => c.code === hovered.code)?.name}
                </span>
              </div>
              <div className="text-3xl font-black font-mono text-primary">{hovered.totalScore.toFixed(2)}</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Strength Index</div>
            </div>
          )}
          
          <div className="absolute bottom-6 left-6 space-y-2 bg-card/50 p-3 rounded border border-border/50 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Index Legend</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm" />
              <span className="text-[10px] font-mono uppercase">Tier 1 (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/60 rounded-sm" />
              <span className="text-[10px] font-mono uppercase">Tier 2 (50-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/30 rounded-sm" />
              <span className="text-[10px] font-mono uppercase">Tier 3 (20-50)</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}