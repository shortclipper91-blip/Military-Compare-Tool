"use client";

import React, { useState, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp, List, Info, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping ISO2 to Numeric IDs for the world map
const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  SA: "682", BR: "076", IT: "380", NO: "578", SE: "752", FI: "246",
  PL: "616", UA: "804", AU: "036", CA: "124", KP: "408", EG: "818",
  ES: "724", MX: "484", DK: "208", VN: "704", PH: "608", TH: "764",
  NG: "566", ZA: "710", AR: "032", RO: "642", BE: "056", PT: "620",
  MA: "504", AZ: "031"
};

// Accurate scoring logic matching the head-to-head comparison
function calculateStrengthScore(country: any, maxVals: any) {
  const normalize = (value: number, max: number) => (max ? value / max : 0) * 100;

  const manpower = normalize(
    (country.metrics.activePersonnel ?? 0) + (country.metrics.reservePersonnel ?? 0),
    maxVals.personnel
  );
  const airPower = normalize(
    (country.metrics.aircraft ?? 0) * 0.5 + (country.metrics.fighterJets ?? 0),
    maxVals.aircraft
  );
  const ground = normalize(
    (country.metrics.tanks ?? 0) + (country.metrics.armoredVehicles ?? 0) * 0.2,
    maxVals.tanks
  );
  const naval = normalize(
    (country.metrics.navalVessels ?? 0) +
      (country.metrics.submarines ?? 0) * 2 +
      (country.metrics.aircraftCarriers ?? 0) * 10,
    maxVals.naval
  );
  const economy = normalize(country.metrics.defenseBudgetUsd ?? 0, maxVals.budget);

  // Balanced weights (0.2 for each primary category)
  return (manpower * 0.2 + airPower * 0.2 + ground * 0.2 + naval * 0.2 + economy * 0.2);
}

function scoreToColor(score: number): string {
  // Use a heat map scale from blue (low) to amber (medium) to gold/orange (high)
  if (score > 60) return "#f59e0b"; // Gold/Orange
  if (score > 30) return "#d97706"; // Dark Amber
  if (score > 15) return "#475569"; // Slate Gray
  return "#1e293b"; // Deep Blue-Gray
}

export default function StrengthMap() {
  const { data: countries = COUNTRIES_DATA, isLoading } = useListCountries();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 20]);
  const [showRankings, setShowRankings] = useState(false);

  // Compute max values for proper normalization
  const maxVals = useMemo(() => {
    const vals = { personnel: 0, aircraft: 0, tanks: 0, naval: 0, budget: 0 };
    countries.forEach((c: any) => {
      vals.personnel = Math.max(vals.personnel, (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0));
      vals.aircraft = Math.max(vals.aircraft, (c.metrics.aircraft ?? 0));
      vals.tanks = Math.max(vals.tanks, (c.metrics.tanks ?? 0));
      vals.naval = Math.max(vals.naval, (c.metrics.navalVessels ?? 0));
      vals.budget = Math.max(vals.budget, (c.metrics.defenseBudgetUsd ?? 0));
    });
    return vals;
  }, [countries]);

  const scoredCountries = useMemo(() => {
    const list = countries.map((c: any) => ({
      ...c,
      score: calculateStrengthScore(c, maxVals)
    }));
    return list.sort((a: any, b: any) => b.score - a.score).map((c: any, i: number) => ({ ...c, rank: i + 1 }));
  }, [countries, maxVals]);

  const scoreMap = useMemo(() => {
    const m: Record<string, any> = {};
    scoredCountries.forEach((c: any) => {
      const numericId = ISO2_TO_NUMERIC[c.code];
      if (numericId) m[numericId] = c;
    });
    return m;
  }, [scoredCountries]);

  const activeCountry = useMemo(() => {
    const code = hovered || selected;
    return scoredCountries.find((c: any) => c.code === code) || null;
  }, [hovered, selected, scoredCountries]);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Global Intelligence Feed</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Strength Map</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">
              Interactive Geospatial Analysis of National Power
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-none border-border/50" onClick={() => setZoom(z => Math.min(z * 1.5, 8))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-none border-border/50" onClick={() => setZoom(z => Math.max(z / 1.5, 1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-none border-border/50" onClick={() => { setZoom(1); setCenter([10, 20]); setSelected(null); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
          <Card className="border-border/50 bg-card/30 rounded-none overflow-hidden relative min-h-[500px] sm:min-h-[600px]">
            <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 160 }} style={{ width: "100%", height: "auto" }}>
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ coordinates, zoom }) => {
                  setCenter(coordinates);
                  setZoom(zoom);
                }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const countryData = scoreMap[geo.id];
                      const isSelected = selected === countryData?.code;
                      const isHovered = hovered === countryData?.code;

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => countryData && setHovered(countryData.code)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => countryData && setSelected(countryData.code === selected ? null : countryData.code)}
                          style={{
                            default: {
                              fill: countryData ? scoreToColor(countryData.score) : "#0f172a",
                              stroke: isSelected ? "#ffd700" : "#1e293b",
                              strokeWidth: isSelected ? 1.5 : 0.4,
                              outline: "none",
                              transition: "all 250ms"
                            },
                            hover: {
                              fill: countryData ? "#fbbf24" : "#1e293b",
                              stroke: "#ffd700",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: countryData ? "pointer" : "default"
                            },
                            pressed: {
                              fill: "#f59e0b",
                              outline: "none"
                            }
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Static Legend (Bottom Left) */}
            <div className="absolute bottom-6 left-6 p-4 bg-card/80 border border-border/50 backdrop-blur-md space-y-3 min-w-[160px]">
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border/50 pb-1">Strength Index</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#f59e0b]" />
                  <span className="text-[9px] font-mono uppercase text-foreground">Global Power</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#d97706]" />
                  <span className="text-[9px] font-mono uppercase text-foreground">Regional Power</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#475569]" />
                  <span className="text-[9px] font-mono uppercase text-foreground">Established Force</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0f172a]" />
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">Limited Intel</span>
                </div>
              </div>
            </div>

            {/* Static Info Box (Bottom Right) */}
            <div className="absolute bottom-6 right-6 w-64 sm:w-80">
              {activeCountry ? (
                <div className="bg-card/90 border border-primary/30 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-primary/10 border-b border-primary/20 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FlagIcon code={activeCountry.code} size={20} />
                      <span className="font-black font-mono uppercase tracking-tight text-sm">{activeCountry.name}</span>
                    </div>
                    <Badge variant="outline" className="rounded-none font-mono text-[9px] border-primary/40 text-primary">
                      RANK #{activeCountry.rank}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">Index Score</div>
                        <div className="text-xl font-black font-mono text-primary">{activeCountry.score.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-tighter">Budget</div>
                        <div className="text-sm font-bold font-mono">{formatCompact(activeCountry.metrics.defenseBudgetUsd)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 border-t border-border/30 pt-3">
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                        <span className="text-muted-foreground">Personnel</span>
                        <span className="font-bold">{formatCompact((activeCountry.metrics.activePersonnel ?? 0) + (activeCountry.metrics.reservePersonnel ?? 0))}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                        <span className="text-muted-foreground">Aircraft</span>
                        <span className="font-bold">{formatNumber(activeCountry.metrics.aircraft)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                        <span className="text-muted-foreground">Tanks</span>
                        <span className="font-bold">{formatNumber(activeCountry.metrics.tanks)}</span>
                      </div>
                      {activeCountry.metrics.nuclearWarheads > 0 && (
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-primary">
                          <span>Strategic Assets</span>
                          <span className="font-bold">{activeCountry.metrics.nuclearWarheads} WH</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card/50 border border-dashed border-border/50 p-6 backdrop-blur-sm text-center">
                  <Info className="w-5 h-5 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Select a nation for detailed telemetry</p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <button
              className="xl:hidden w-full flex items-center justify-between p-3 bg-card border border-border/50 font-mono text-xs uppercase tracking-widest"
              onClick={() => setShowRankings(!showRankings)}
            >
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary" />
                Global Rankings ({scoredCountries.length})
              </div>
              {showRankings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className={cn(
              "xl:block space-y-2",
              !showRankings && "hidden xl:block"
            )}>
              <div className="hidden xl:block text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] mb-4">Tactical Ranking</div>
              <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {scoredCountries.map((c: any) => (
                  <button
                    key={c.code}
                    onClick={() => setSelected(selected === c.code ? null : c.code)}
                    onMouseEnter={() => setHovered(c.code)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 transition-all border group",
                      selected === c.code 
                        ? "bg-primary/10 border-primary/50" 
                        : "bg-card/40 border-border/30 hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground/50 group-hover:text-primary w-6 text-left">#{c.rank}</span>
                    <FlagIcon code={c.code} size={16} />
                    <span className="text-[10px] font-mono uppercase font-bold flex-1 text-left truncate">{c.name}</span>
                    <span className={cn(
                      "text-[10px] font-mono font-black",
                      selected === c.code ? "text-primary" : "text-muted-foreground/70"
                    )}>{c.score.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}