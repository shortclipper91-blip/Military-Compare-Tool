"use client";

import React, { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp, List } from "lucide-react";
import { Button } from "@/components/ui/button";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Updated mapping ISO2 to Numeric IDs for the mapconst ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  SA: "682", BR: "076", IT: "380", NO: "578", SE: "752", FI: "246",
  PL: "616", UA: "804", AU: "036", CA: "124", KP: "408", EG: "818",
  ES: "724", MX: "484", DK: "208", AU: "036", CN: "156"
};

// Use the same normalization logic as the head‑to‑head comparison
function computeScoreWithNormalization(
  c: {
    metrics: {
      activePersonnel?: number | null;
      defenseBudgetUsd?: number | null;
      aircraft?: number | null;
      tanks?: number | null;
      navalVessels?: number | null;
      nuclearWarheads?: number | null;
    };
  },
  maxVals: {
    personnel: number;
    aircraft: number;
    tanks: number;
    naval: number;
    budget: number;
  }
): number {
  const m = c.metrics;
  return (
    ((m.activePersonnel ?? 0) / maxVals.personnel) * 0.30 +
    ((m.defenseBudgetUsd ?? 0) / maxVals.budget) * 0.35 +
    ((m.aircraft ?? 0) / maxVals.aircraft) * 0.15 +
    ((m.tanks ?? 0) / maxVals.tanks) * 0.10 +
    ((m.navalVessels ?? 0) / maxVals.naval) * 0.10 +
    (Math.min(m.nuclearWarheads ?? 0, 1000) / 1000) * 0.10
  );
}

function scoreToColor(score: number, isAdded: boolean): string {
  // Base color based on score
  let baseColor: string;
  if (score > 0.6) baseColor = "#ff9800"; // orange for high
  else if (score > 0.3) baseColor = "#d97706"; // amber for medium
  else baseColor = "#1e293b"; // dark for low

  // If the country has been added to the comparison, overlay a bright accent
  if (isAdded) {
    // Return a brighter, more saturated version
    return `rgba(${baseColor.replace('#', '').split(',').map(v => parseInt(v)).join(',')}, 0.9)`;
  }
  return baseColor;
}

const TIER_LABELS = [
  { label: "Tier 1 — Global Power", min: 0.35 },
  { label: "Tier 2 — Major Regional", min: 0.12 },
  { label: "Tier 3 — Regional Power", min: 0.05 },
  { label: "Tier 4 — Limited Force", min: 0 },
];

function getTier(score: number) {
  for (const t of TIER_LABELS) {
    if (score >= t.min) return t.label;
  }
  return TIER_LABELS[TIER_LABELS.length - 1].label;
}

export default function StrengthMap() {
  const { data: countries = [], isLoading } = useListCountries();
  const [tooltip, setTooltip] = useState<{
    name: string;
    code: string;
    score: number;
    rank: number;
    isAdded: boolean;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showRankings, setShowRankings] = useState(false);
  const mobileDetailRef = React.useRef<HTMLDivElement>(null);

  const selectCountry = (code: string | null) => {
    setSelected((prev) => {
      const next = prev === code ? null : code;
      if (next) {
        setTimeout(() => mobileDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
      }
      return next;
    });
  };

  const scored = React.useMemo(() => {
    const withScores = countries.map((c) => ({
      ...c,
      score: computeScoreWithNormalization(c, { /* placeholders will be replaced below */ })
    }));
    withScores.sort((a, b) => b.score - a.score);
    return withScores.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [countries]);

  // Compute global max values from the scored list for normalization
  const maxVals = React.useMemo(() => {
    const personnel = Math.max(...scored.map((c) => (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0)));
    const aircraft = Math.max(...scored.map((c) => c.metrics.aircraft ?? 0));
    const tanks = Math.max(...scored.map((c) => c.metrics.tanks ?? 0));
    const naval = Math.max(...scored.map((c) => c.metrics.navalVessels ?? 0));
    const budget = Math.max(...scored.map((c) => c.metrics.defenseBudgetUsd ?? 0));
    return { personnel, aircraft, tanks, naval, budget };
  }, [scored]);

  // Re‑calculate scores using the shared maxVals  const scoredWithNormalized = React.useMemo(() => {
    return scored.map((c) => ({
      ...c,
      score: computeScoreWithNormalization(c, maxVals)
    }));
  }, [scored, maxVals]);

  // Update the scored array to use the normalized scores
  const updatedScored = React.useMemo(() => {
    const withScores = scoredWithNormalization.map((c, i) => ({
      ...c,
      score: c.score,
      rank: i + 1
    }));
    return withScores.sort((a, b) => b.score - a.score);
  }, [scoredWithNormalization]);

  const scoreMap = React.useMemo(() => {
    const m: Record<string, { score: number; rank: number; code: string; name: string; isAdded: boolean }> = {};
    for (const c of updatedScored) {
      const num = ISO2_TO_NUMERIC[c.code];
      if (num) {
        m[num] = {
          score: c.score,
          rank: c.rank,
          code: c.code,
          name: c.name,
          isAdded: selected === c.code        };
      }
    }
    return m;
  }, [updatedScored, selected]);

  const selectedCountry = selected ? updatedScored.find((c) => c.code === selected) : null;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground uppercase flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" /> Global Strength Index Map            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {updatedScored.length} nations indexed · hover to inspect · click to lock
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setZoom((z) => Math.min(z * 1.4, 8))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setZoom((z) => Math.max(z / 1.4, 1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => { setZoom(1); setCenter([0, 20]); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80">
                <span className="font-mono text-sm text-muted-foreground animate-pulse">LOADING INTEL...</span>
              </div>
            )}

            <ComposableMap projection="geoNaturalEarth1" projectionConfig={{ scale: 147 }}>
              <ZoomableGroup                zoom={zoom}
                center={center}
                onMoveEnd={({ zoom: z, coordinates }) => {
                  setZoom(z);
                  setCenter(coordinates);
                }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) => {
                    return geographies.map((geo) => {
                      const id = geo.id as string;
                      const info = scoreMap[id];
                      const isSelected = selected && info && updatedScored.find((c) => c.code === selected && ISO2_TO_NUMERIC[c.code] === id);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (info) {
                              setTooltip({
                                name: info.name,
                                code: info.code,
                                score: info.score,
                                rank: info.rank,
                                isAdded: info.isAdded
                              });
                            }
                          }}
                          onMouseLeave={() => {
                            if (!selected) setTooltip(null);
                          }}
                          onClick={() => {
                            if (info) {
                              const code = Object.entries(ISO2_TO_NUMERIC).find(([_, v]) => v === id)?.[0];
                              if (code) {
                                selectCountry(code);
                                setTooltip({
                                  name: info.name,
                                  code: info.code,
                                  score: info.score,
                                  rank: info.rank,
                                  isAdded: true
                                });
                              }
                            }
                          }}
                          style={{
                            default: {
                              fill: info ? scoreToColor(info.score, info.isAdded) : "#1a2235",
                              stroke: isSelected ? "#f59e0b" : "#0f172a",
                              strokeWidth: isSelected ? 1.5 : 0.5,
                              outline: "none"
                            },
                            hover: {
                              fill: info ? scoreToColor(info.score + 0.1, info.isAdded) : "#263047",
                              stroke: "#f59e0b",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: info ? "pointer" : "default"
                            },
                            pressed: {
                              fill: info ? scoreToColor(info.score + 0.15, info.isAdded) : "#263047",
                              outline: "none"
                            }
                          }}
                        />
                      );
                    });
                  }}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Legend & static hover index (now above the legend) */}
            <div className="absolute top-3 right-3 bg-card/95 border border-border rounded-md px-3 py-2 text-sm font-mono shadow-xl pointer-events-none">
              {tooltip && (
                <div className="flex items-center gap-2">
                  <FlagIcon code={tooltip.code} size={20} />
                  <span className="font-bold text-foreground">{tooltip.name}</span>
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  Rank <span className="text-primary">#{tooltip.rank}</span> · Score{" "} 
                  <span className="text-primary">{tooltip.score.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{getTier(tooltip.score)}</div>
              </div>
            </div>

            {/* Static hover index box – always visible above legend */}
            {tooltip && !selected && (
              <div className="absolute top-3 right-3 bg-card/95 border border-border rounded-md px-3 py-2 text-sm font-mono shadow-xl pointer-events-none">
                <div className="flex items-center gap-2">
                  <FlagIcon code={tooltip.code} size={20} />
                  <span className="font-bold text-foreground">{tooltip.name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Rank <span className="text-primary">#{tooltip.rank}</span> · Score{" "}                   <span className="text-primary">{tooltip.score.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{getTier(tooltip.score)}</div>
              </div>
            )}

            {/* Tooltip on hover (only when not selected) */}
            {tooltip && !selected && (
              <div className="absolute top-3 right-3 bg-card/95 border border-border rounded-md px-3 py-2 text-sm font-mono shadow-xl pointer-events-none">
                <div className="font-bold text-foreground flex items-center gap-2">
                  <FlagIcon code={tooltip.code} size={20} />
                  {tooltip.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Rank <span className="text-primary">#{tooltip.rank}</span> · Score{" "} 
                  <span className="text-primary">{tooltip.score.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground">{getTier(tooltip.score)}</div>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-4">
            {/* Rankings header – collapsible on mobile */}
            <button              className="xl:hidden w-full flex items-center justify-between mb-2"
              onClick={() => setShowRankings((s) => !s)}
            >
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                <List className="w-3 h-3" />
                Global Rankings ({updatedScored.length})
              </div>
              {showRankings ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <div
              className={`hidden xl:block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3`}
              >Global Rankings</div>
            <div
              className={`space-y-1 overflow-y-auto max-h-[calc(100vh-340px)] ${showRankings ? "block" : "hidden xl:block"}`}
            >
              {updatedScored.map((c) => (
                <button
                  key={c.code}
                  onClick={() => selectCountry(c.code)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${selected === c.code ? "bg-primary/20 border border-primary/30" : "hover:bg-accent/50"}`}
                >
                  <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{c.rank}</span>
                  <FlagIcon code={c.code} size={20} />
                  <span className="text-xs font-mono text-foreground flex-1 truncate">{c.name}</span>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(c.score * 200, 100)}%`,
                        background: scoreToColor(c.score, selected === c.code)
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-primary w-8 text-right shrink-0">
                    {(c.score * 100).toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}