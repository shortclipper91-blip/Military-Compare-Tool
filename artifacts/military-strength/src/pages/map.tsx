import { useState, useMemo, useRef } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp, List, Target, Zap, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountrySelect } from "@/components/country-select";
import { cn } from "@/lib/utils";

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
    const withScores = countries.map((c) => ({
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

  const activeCode = selected || hovered;
  const activeCountry = activeCode ? scored.find((c) => c.code === activeCode) : null;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-foreground uppercase flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Global Strength Index Map
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {scored.length} nations indexed · hover to inspect · click to lock
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CountrySelect
              countries={countries}
              value={selected || ""}
              onChange={(val) => setSelected(val || null)}
              placeholder="Search nation..."
              className="w-48 h-8 text-xs"
            />
            <div className="flex gap-1">
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
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
                      const isHovered = hovered && info && hovered === info.code;
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (info) setHovered(info.code);
                          }}
                          onMouseLeave={() => {
                            setHovered(null);
                          }}
                          onClick={() => {
                            if (info) setSelected(info.code === selected ? null : info.code);
                          }}
                          style={{
                            default: {
                              fill: info ? scoreToColor(info.score) : "#1a2235",
                              stroke: isSelected || isHovered ? "#f59e0b" : "#0f172a",
                              strokeWidth: isSelected || isHovered ? 1.5 : 0.5,
                              outline: "none",
                            },
                            hover: {
                              fill: info ? scoreToColor(info.score + 0.05) : "#263047",
                              stroke: "#f59e0b",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: info ? "pointer" : "default",
                            },
                            pressed: {
                              fill: info ? scoreToColor(info.score + 0.1) : "#263047",
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            <div className="absolute bottom-3 left-3 flex flex-col gap-1">
              <div className="text-[10px] font-mono text-muted-foreground mb-1 uppercase tracking-wider">Strength Index</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-sm" style={{
                  background: "linear-gradient(to right, #1e2a3a, #8b2800, #f59e0b)"
                }} />
                <div className="flex justify-between w-32 text-[9px] font-mono text-muted-foreground -mt-3">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {/* Target Profile Card - Fixed in Sidebar */}
            <Card className={cn(
              "border-2 transition-all duration-300 min-h-[280px] flex flex-col",
              activeCountry ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/40 border-dashed"
            )}>
              {activeCountry ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <FlagIcon code={activeCountry.code} size={32} className="rounded shadow-sm" />
                      <div className="flex flex-col">
                        <span className="font-bold font-mono text-sm uppercase tracking-tight leading-tight">{activeCountry.name}</span>
                        <span className="text-[9px] font-mono text-primary uppercase tracking-widest">Rank #{activeCountry.rank} Globally</span>
                      </div>
                    </div>
                    {selected === activeCountry.code && (
                      <button onClick={() => setSelected(null)} className="p-1 text-muted-foreground hover:text-primary">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                    <div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Personnel</div>
                      <div className="text-xs font-bold font-mono">{(activeCountry.metrics.activePersonnel ?? 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Budget</div>
                      <div className="text-xs font-bold font-mono">${((activeCountry.metrics.defenseBudgetUsd ?? 0) / 1e9).toFixed(1)}B</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Aircraft</div>
                      <div className="text-xs font-bold font-mono">{(activeCountry.metrics.aircraft ?? 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Naval</div>
                      <div className="text-xs font-bold font-mono">{(activeCountry.metrics.navalVessels ?? 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Strength Index</div>
                      <span className="text-xs font-mono font-bold text-primary">{(activeCountry.score * 100).toFixed(1)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${Math.min(activeCountry.score * 200, 100)}%` }} 
                      />
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground mt-1 uppercase text-center">{getTier(activeCountry.score)}</div>
                  </div>
                  
                  {!selected && (
                    <div className="flex items-center gap-2 justify-center py-1 bg-primary/10 border border-primary/20 rounded">
                      <Target className="w-3 h-3 text-primary animate-pulse" />
                      <span className="text-[8px] font-mono text-primary font-bold uppercase tracking-widest">Click to Lock Intel</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center text-center space-y-3 opacity-30 my-auto">
                  <Target className="w-8 h-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest">No Active Target</p>
                    <p className="text-[8px] font-mono">Hover or search to inspect forces</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="border-border/50 bg-card/40 p-3 flex-1 overflow-hidden">
              <button
                className="xl:hidden w-full flex items-center justify-between mb-2"
                onClick={() => setShowRankings((s) => !s)}
              >
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  <List className="w-3 h-3" />
                  Global Rankings ({scored.length})
                </div>
                {showRankings ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              <div className="hidden xl:block text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary/50" />
                Map Intelligence
              </div>

              <div className={`space-y-1 overflow-y-auto max-h-[300px] ${showRankings ? "block" : "hidden xl:block"}`}>
                {scored.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelected(c.code === selected ? null : c.code)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      selected === c.code ? "bg-primary/20 border border-primary/30" : "hover:bg-accent/50"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">#{c.rank}</span>
                    <FlagIcon code={c.code} size={16} />
                    <span className="text-[10px] font-mono text-foreground flex-1 truncate">{c.name}</span>
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