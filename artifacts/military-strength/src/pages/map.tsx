import { useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

function computeScore(c: {
  metrics: {
    activePersonnel?: number | null;
    defenseBudgetUsd?: number | null;
    aircraft?: number | null;
    tanks?: number | null;
    navalVessels?: number | null;
    nuclearWarheads?: number | null;
  };
}): number {
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
  const [tooltip, setTooltip] = useState<{ name: string; code: string; score: number; rank: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 10]);
  const [selected, setSelected] = useState<string | null>(null);

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

  const selectedCountry = selected ? scored.find((c) => c.code === selected) : null;

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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative">
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
                  setCenter(coordinates);
                }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const id = geo.id as string;
                      const info = scoreMap[id];
                      const isSelected = selected && info && scored.find((c) => c.code === selected && ISO2_TO_NUMERIC[c.code] === id);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            if (info) setTooltip({ name: info.name, code: info.code, score: info.score, rank: info.rank });
                          }}
                          onMouseLeave={() => {
                            if (!selected) setTooltip(null);
                          }}
                          onClick={() => {
                            if (info) {
                              const code = Object.entries(ISO2_TO_NUMERIC).find(([, v]) => v === id)?.[0];
                              if (code) {
                                setSelected((prev) => prev === code ? null : code);
                                setTooltip({ name: info.name, code: info.code, score: info.score, rank: info.rank });
                              }
                            }
                          }}
                          style={{
                            default: {
                              fill: info ? scoreToColor(info.score) : "#1a2235",
                              stroke: isSelected ? "#f59e0b" : "#0f172a",
                              strokeWidth: isSelected ? 1.5 : 0.5,
                              outline: "none",
                            },
                            hover: {
                              fill: info ? scoreToColor(info.score + 0.1) : "#263047",
                              stroke: "#f59e0b",
                              strokeWidth: 1,
                              outline: "none",
                              cursor: info ? "pointer" : "default",
                            },
                            pressed: {
                              fill: info ? scoreToColor(info.score + 0.15) : "#263047",
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
              <div className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Strength Index</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 rounded-sm" style={{
                  background: "linear-gradient(to right, #1e2a3a, #8b2800, #f59e0b)"
                }} />
                <div className="flex justify-between w-32 text-[10px] font-mono text-muted-foreground -mt-3">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {tooltip && !selected && (
              <div className="absolute top-3 right-3 bg-card/95 border border-border rounded-md px-3 py-2 text-sm font-mono shadow-xl pointer-events-none">
                <div className="font-bold text-foreground flex items-center gap-2"><FlagIcon code={tooltip.code} size={20} /> {tooltip.name}</div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  Rank <span className="text-primary">#{tooltip.rank}</span> · Score{" "}
                  <span className="text-primary">{(tooltip.score * 100).toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted-foreground/70 mt-0.5">{getTier(tooltip.score)}</div>
              </div>
            )}
          </Card>

          <div className="flex flex-col gap-4">
            {selectedCountry && (
              <Card className="border-primary/40 bg-card/60 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <FlagIcon code={selectedCountry.code} size={40} className="rounded" />
                    <div className="font-bold font-mono text-foreground mt-1">{selectedCountry.name}</div>
                    <Badge variant="outline" className="text-primary border-primary/50 text-xs mt-1">
                      #{selectedCountry.rank} Globally
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => setSelected(null)}>✕</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  {[
                    { label: "Personnel", value: ((selectedCountry.metrics.activePersonnel ?? 0) / 1000).toFixed(0) + "K" },
                    { label: "Defense Budget", value: "$" + ((selectedCountry.metrics.defenseBudgetUsd ?? 0) / 1e9).toFixed(0) + "B" },
                    { label: "Aircraft", value: (selectedCountry.metrics.aircraft ?? 0).toLocaleString() },
                    { label: "Tanks", value: (selectedCountry.metrics.tanks ?? 0).toLocaleString() },
                    { label: "Naval Vessels", value: (selectedCountry.metrics.navalVessels ?? 0).toLocaleString() },
                    { label: "Nuclear", value: (selectedCountry.metrics.nuclearWarheads ?? 0) > 0 ? (selectedCountry.metrics.nuclearWarheads ?? 0).toLocaleString() : "None" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</div>
                      <div className="text-sm font-bold text-foreground font-mono">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Strength Index</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(selectedCountry.score * 200, 100)}%`,
                          background: scoreToColor(selectedCountry.score),
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-primary font-bold">
                      {(selectedCountry.score * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1">{getTier(selectedCountry.score)}</div>
                </div>
              </Card>
            )}

            <Card className="border-border/50 bg-card/40 p-3 flex-1 overflow-hidden">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Global Rankings</div>
              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-340px)]">
                {scored.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelected((prev) => prev === c.code ? null : c.code)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      selected === c.code ? "bg-primary/20 border border-primary/30" : "hover:bg-accent/50"
                    }`}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">#{c.rank}</span>
                    <FlagIcon code={c.code} size={20} />
                    <span className="text-xs font-mono text-foreground flex-1 truncate">{c.name}</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(c.score * 200, 100)}%`,
                          background: scoreToColor(c.score),
                        }}
                      />
                    </div>
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
