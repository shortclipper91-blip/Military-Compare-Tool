"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { Card, CardContent } from "@/components/ui/card";
import { FlagIcon } from "@/components/flag-icon";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  JP: "392", KR: "410", IL: "376", KP: "408"
};

export default function MapPage() {
  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const [hovered, setHovered] = useState<any>(null);

  const getColor = (score: number) => {
    if (score > 80) return "hsl(var(--primary))";
    if (score > 50) return "hsl(var(--primary) / 0.6)";
    if (score > 20) return "hsl(var(--primary) / 0.3)";
    return "hsl(var(--muted))";
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Global Strength Map</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Geospatial Power Distribution Index</p>
        </header>

        <Card className="border-border/50 bg-card/30 overflow-hidden relative">
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
                          default: { fill: score ? getColor(score.totalScore) : "hsl(var(--muted) / 0.2)", outline: "none", stroke: "hsl(var(--border))", strokeWidth: 0.5 },
                          hover: { fill: score ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.4)", outline: "none" },
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
            <div className="absolute bottom-6 right-6 bg-card border border-border p-4 rounded shadow-xl animate-in fade-in slide-in-from-bottom-2">
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
        </Card>
      </div>
    </Layout>
  );
}