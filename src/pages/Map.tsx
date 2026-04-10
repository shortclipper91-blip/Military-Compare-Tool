"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlagIcon } from "@/components/flag-icon";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Target, Users, Shield, Zap, Info, List } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ISO2_TO_NUMERIC: Record<string, string> = {
  US: "840", RU: "643", CN: "156", IN: "356", GB: "826", FR: "250",
  DE: "276", JP: "392", KR: "410", TR: "792", PK: "586", IL: "376",
  BR: "076", IT: "380", EG: "818", SA: "682", AU: "036", CA: "124",
  UA: "804", PL: "616", KP: "408", NO: "578", SE: "752", FI: "246", DK: "208"
};

export default function MapPage() {
  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const [selectedCode, setSelectedCode] = useState<string | null>("US");
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const selectedCountry = useMemo(() => 
    COUNTRIES_DATA.find(c => c.code === selectedCode), 
  [selectedCode]);

  const selectedScore = useMemo(() => 
    scores.find(s => s.code === selectedCode), 
  [selectedCode, scores]);

  const getColor = (score: number) => {
    if (score > 80) return "hsl(var(--primary))";
    if (score > 50) return "hsl(var(--primary) / 0.7)";
    if (score > 20) return "hsl(var(--primary) / 0.4)";
    return "hsl(var(--primary) / 0.15)";
  };

  const IntelRow = ({ label, value, icon: Icon }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="font-mono text-sm font-bold">{value}</div>
    </div>
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-[calc(100vh-120px)]">
        <header>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Global Intel Command</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Geospatial Strength Distribution & Tactical Data</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 flex-1 min-h-0">
          {/* Map Section */}
          <Card className="border-border/50 bg-card/30 overflow-hidden relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <div className="bg-card/80 backdrop-blur-md border border-border p-3 rounded space-y-2">
                <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Strength Index</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 1 (80+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/70 rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 2 (50-80)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/40 rounded-sm" />
                  <span className="text-[10px] font-mono uppercase">Tier 3 (20-50)</span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-950/50">
              <ComposableMap projectionConfig={{ scale: 140 }} className="w-full h-full">
                <ZoomableGroup>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryCode = Object.keys(ISO2_TO_NUMERIC).find(key => ISO2_TO_NUMERIC[key] === geo.id);
                        const score = scores.find(s => s.code === countryCode);
                        const isSelected = selectedCode === countryCode;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            onMouseEnter={() => countryCode && setHoveredCode(countryCode)}
                            onMouseLeave={() => setHoveredCode(null)}
                            onClick={() => countryCode && setSelectedCode(countryCode)}
                            style={{
                              default: { 
                                fill: score ? getColor(score.totalScore) : "hsl(var(--muted) / 0.05)", 
                                outline: "none", 
                                stroke: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.5)", 
                                strokeWidth: isSelected ? 1.5 : 0.5 
                              },
                              hover: { 
                                fill: score ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.2)", 
                                outline: "none",
                                cursor: countryCode ? "pointer" : "default",
                                stroke: "hsl(var(--primary))",
                                strokeWidth: 1
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
            </div>

            {hoveredCode && (
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md border border-border px-3 py-2 rounded shadow-xl pointer-events-none animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2">
                  <FlagIcon code={hoveredCode} size={16} />
                  <span className="font-bold uppercase tracking-tighter text-xs">
                    {COUNTRIES_DATA.find(c => c.code === hoveredCode)?.name}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Intel Panel */}
          <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            {selectedCountry && selectedScore ? (
              <>
                <Card className="border-primary/30 bg-primary/5 shrink-0">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FlagIcon code={selectedCountry.code} size={32} />
                        <div>
                          <CardTitle className="text-xl font-black uppercase tracking-tighter">{selectedCountry.name}</CardTitle>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{selectedCountry.region}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black font-mono text-primary">{selectedScore.totalScore.toFixed(2)}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">Strength Index</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-background/50 p-2 rounded border border-border/50">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase">Global Rank</div>
                        <div className="text-lg font-bold font-mono">#{scores.sort((a, b) => b.totalScore - a.totalScore).findIndex(s => s.code === selectedCode) + 1}</div>
                      </div>
                      <div className="bg-background/50 p-2 rounded border border-border/50">
                        <div className="text-[9px] font-mono text-muted-foreground uppercase">Nuclear Status</div>
                        <div className="text-lg font-bold font-mono text-primary">{selectedCountry.metrics.nuclearWarheads > 0 ? "ACTIVE" : "NONE"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/30 flex-1">
                  <CardHeader className="border-b border-border/50 py-3">
                    <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3 h-3 text-primary" />
                      Detailed Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    <section>
                      <div className="text-[9px] font-mono text-primary uppercase mb-2 tracking-widest">Personnel</div>
                      <IntelRow icon={Users} label="Active Duty" value={formatCompact(selectedCountry.metrics.activePersonnel)} />
                      <IntelRow icon={Users} label="Reserve Force" value={formatCompact(selectedCountry.metrics.reservePersonnel)} />
                    </section>

                    <section>
                      <div className="text-[9px] font-mono text-primary uppercase mb-2 tracking-widest">Air & Ground</div>
                      <IntelRow icon={Target} label="Combat Aircraft" value={formatCompact(selectedCountry.metrics.aircraft)} />
                      <IntelRow icon={Target} label="Main Battle Tanks" value={formatCompact(selectedCountry.metrics.tanks)} />
                      <IntelRow icon={Target} label="Armored Vehicles" value={formatCompact(selectedCountry.metrics.armoredVehicles)} />
                    </section>

                    <section>
                      <div className="text-[9px] font-mono text-primary uppercase mb-2 tracking-widest">Naval & Strategic</div>
                      <IntelRow icon={Shield} label="Total Vessels" value={formatCompact(selectedCountry.metrics.navalVessels)} />
                      <IntelRow icon={Shield} label="Submarines" value={formatCompact(selectedCountry.metrics.submarines)} />
                      <IntelRow icon={Zap} label="Nuclear Warheads" value={selectedCountry.metrics.nuclearWarheads} />
                    </section>

                    <section>
                      <div className="text-[9px] font-mono text-primary uppercase mb-2 tracking-widest">Economic Power</div>
                      <IntelRow icon={Shield} label="Defense Budget" value={formatCurrency(selectedCountry.metrics.defenseBudgetUsd)} />
                      <IntelRow icon={Shield} label="GDP (Nominal)" value={formatCurrency(selectedCountry.metrics.gdpUsd)} />
                    </section>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-dashed border-border bg-transparent h-full flex items-center justify-center p-8 text-center">
                <div className="space-y-4">
                  <List className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Select a nation on the map to initialize intelligence feed</div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}