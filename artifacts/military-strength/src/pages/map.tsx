"use client";

import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "../components/layout";
import { FlagIcon } from "../components/flag-icon";
import { useListCountries } from "@workspace/api-client-react";
import { CountrySelector } from "../components/country-selector";
import { Card, CardContent } from "../components/ui/card";
import { Map as MapIcon, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp, List, Target, Zap, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  SA: "682", BR: "076", IT: "380", NO: "578", SE: "752", FI: "246",
  PL: "616", UA: "804", AU: "036", CA: "124", KP: "408", EG: "818",
  IR: "364", ES: "724", GR: "300", NL: "528", ID: "360", VN: "704",
  TW: "158", PH: "608", TH: "764", NG: "566", ZA: "710", MX: "484",
  AR: "032", RO: "642", BE: "056", PT: "620", DK: "208", MA: "504",
  AZ: "031",
};

function computeScore(c: any): number {
  const m = c.metrics;
  if (!m) return 0;
  return (
    ((m.activePersonnel ?? 0) / 2035000) * 0.20 +
    ((m.defenseBudgetUsd ?? 0) / 886e9) * 0.35 +
    ((m.aircraft ?? 0) / 13300) * 0.15 +
    ((m.tanks ?? 0) / 12420) * 0.10 +
    ((m.navalVessels ?? 0) / 730) * 0.10 +
    (Math.min(m.nuclearWarheads ?? 0, 1000) / 1000) * 0.10
  );
}

function scoreToColor(score: number, alpha = 1): string {
  if (score <= 0) return `rgba(30,41,59,${alpha})`;
  const t = Math.min(score / 0.6, 1);
  const r = Math.round(15 + t * (245 - 15));
  const g = Math.round(23 + (1 - t) * (180 - 23));
  const b = Math.round(42 + (1 - t) * (30 - 42));
  return `rgba(${r},${g},${b},${alpha})`;
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
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 10]);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showRankings, setShowRankings] = useState(false);

  const scored = useMemo(() => {
    const withScores = (countries || []).map((c) => ({
      ...c,
      score: computeScore(c),
    }));
    withScores.sort((a, b) => b.score - a.score);
    return withScores.map((c, i) => ({ ...c, rank: i + 1 }));
  }, [countries]);

  const scoreMap = useMemo(() => {
    const m: Record<string, { score: number; rank: number; code: string; name: string }> = {};
    for (const c of scored) {
      const num = ISO2_TO_NUMERIC[c.code];
      if (num) m[num] = { score: c.score, rank: c.rank, code: c.code, name: c.name };
    }
    return m;
  }, [scored]);

  const focusedCountry = useMemo(() => {
    const code = selected || hovered;
    if (!code) return null;
    const country = scored.find((c) => c.code === code);
    if (!country) return null;
    return {
      ...country,
      isLocked: !!selected
    };
  }, [selected, hovered, scored]);

  return (
    <Layout>
      <div className="space-y-4">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground uppercase flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-primary" />
              Global Strength Index Map
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {scored.length} nations indexed · hover to inspect
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card/50 p-2 border border-border/50 backdrop-blur-sm">
            <CountrySelector
              placeholder="Search Intel Database..."
              value={selected || ""}
              onChange={setSelected}
              countries={scored}
              className="w-full sm:w-64"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setZoom((z) => Math.min(z * 1.4, 8))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setZoom((z) => Math.max(z / 1.4, 1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => { setZoom(1); setCenter([10, 10]); setSelected(null); }}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative min-h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80">
                <span className="font-mono text-sm text-muted-foreground animate-pulse">LOADING INTEL...</span>
              </div>
            )}

            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: 147 }}
              style={{ width: "100%", height: "auto" }}
            >
              <ZoomableGroup
                zoom={zoom}
                center={center}
                onMoveEnd={({ zoom: z, coordinates }) => {
                  setZoom(z);
                  setCenter(coordinates as [number, number]);
                }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const id = geo.id as string;
                      const info = scoreMap[id];
                      const isSelected = selected && info && selected === info.code;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => { if (info) setHovered(info.code); }}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => { if (info) setSelected(info.code === selected ? null : info.code); }}
                          style={{
                            default: {
                              fill: isSelected ? "#fbbf24" : (info ? scoreToColor(info.score) : "#1a2235"),
                              stroke: isSelected ? "#ffffff" : "#0f172a",
                              strokeWidth: isSelected ? 1.5 : 0.5,
                              outline: "none",
                            },
                            hover: {
                              fill: info ? "#fbbf24" : "#263047",
                              stroke: "#ffffff",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: info ? "pointer" : "default",
                            },
                            pressed: { fill: "#f59e0b", outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </Card>

          <div className="space-y-4">
            <Card className={cn(
              "border-2 min-h-[240px] flex flex-col justify-center",
              focusedCountry ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/30 border-dashed"
            )}>
              {focusedCountry ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FlagIcon code={focusedCountry.code} size={28} />
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-sm leading-tight">{focusedCountry.name}</span>
                        <span className="text-[8px] font-mono text-primary uppercase tracking-[0.2em]">Rank: #{focusedCountry.rank}</span>
                      </div>
                    </div>
                    {focusedCountry.isLocked && (
                      <button onClick={() => setSelected(null)} className="p-1 text-muted-foreground hover:text-primary">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-3 h-3 text-primary" />
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">Strength Index</div>
                      </div>
                      <div className="text-4xl font-black font-mono text-primary leading-none tabular-nums">
                        {(focusedCountry.score * 100).toFixed(1)}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Capabilities Tier</div>
                        <span className="text-[10px] font-mono font-bold text-primary">
                          {getTier(focusedCountry.score).split('—')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center text-center opacity-30">
                  <Target className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">No Active Target</p>
                </div>
              )}
            </Card>

            <Card className="border-border/50 bg-card/40 p-3">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Global Rankings</div>
              <div className="space-y-1 overflow-y-auto max-h-[300px]">
                {scored.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelected(c.code === selected ? null : c.code)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                      selected === c.code ? "bg-primary/20 border border-primary/30" : "hover:bg-accent/50"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">#{c.rank}</span>
                    <FlagIcon code={c.code} size={20} />
                    <span className="text-[10px] font-mono text-foreground flex-1 truncate uppercase">{c.name}</span>
                    <span className="text-[10px] font-mono text-primary w-8 text-right shrink-0">
                      {(c.score * 100).toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}