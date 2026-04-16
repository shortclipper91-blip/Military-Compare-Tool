"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Users, Plane, Target, Anchor, DollarSign, Zap, ArrowRightLeft, ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useListCountries } from "@workspace/api-client-react";
import html2canvas from "html2canvas";
import METRIC_DESCRIPTIONS from "@/lib/metricDescriptions";
import { cn } from "@/lib/utils";

const [selected, setSelected] = useState(["US", "CN"]);
const [scenario, setScenario] = useState<"full" | "air" | "naval" | "ground">("full");
const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
const [filterPanelOpen, setFilterPanelOpen] = useState(false);
const [filterValues, setFilterValues] = useState({
  continent: "",
  alliance: "",
  region: "",
});

const { data: countries = [] } = useListCountries({});
const filteredCountries = useMemo(() => {
  return COUNTRIES_DATA.filter((c) => {
    const f = filterValues;
    return (
      (f.continent ? c.continent === f.continent : true) &&
      (f.alliance ? c.alliances.includes(f.alliance) : true) &&
      (f.region ? c.region === f.region : true)
    );
  });
}, [filterValues]);

const [scoreA, setScoreA] = useState<any>(null);
const [scoreB, setScoreB] = useState<any>(null);
const [radarData, setRadarData] = useState<any[]>([]);

useEffect(() => {
  if (selected.length >= 2) {
    const comparisonRequest = {
      countryCodes: selected,
      weights: weights as any,
      scenario,
    };
    // Simulate compareCountries call – in real app this would call the API
    // Here we just reuse the client‑side scoring logic for demo purposes
    const allScores = calculateScores(COUNTRIES_DATA);
    const scoreAObj = allScores.find((s) => s.code === selected[0]) || allScores[0];
    const scoreBObj = allScores.find((s) => s.code === selected[1]) || allScores[1];
    setScoreA(allScoreObj);
    setScoreB(allScoreObj);
    const radar = [
      { category: "Manpower", A: scoreAObj.categories.manpower, B: scoreBObj.categories.manpower },
      { category: "Air Power", A: scoreAObj.categories.airPower, B: scoreBObj.categories.airPower },
      { category: "Ground", A: scoreAObj.categories.groundForces, B: scoreBObj.categories.groundForces },
      { category: "Naval", A: scoreAObj.categories.navalForces, B: scoreBObj.categories.navalForces },
      { category: "Economy", A: scoreAObj.categories.economy, B: scoreBObj.categories.economy },
    ];
    setRadarData(radar);
  }
}, [selected, weights, scenario]);

const exportAsImage = async () => {
  const element = document.querySelector(".radar-chart-container");
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2 });
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "military-comparison.png";
  link.click();
};

const StatRow = ({
  label,
  valA,
  valB,
  format = "compact",
  source,
}: {
  label: string;
  valA: number | null | undefined;
  valB: number | null | undefined;
  format?: "compact" | "currency" | "number";
  source?: string;
}) => {
  const isAWinner = (valA || 0) > (valB || 0);
  const isBWinner = (valB || 0) > (valA || 0);
  const fmt = (v: number) =>
    format === "currency"
      ? formatCurrency(v)
      : formatCompact(v);
  const desc = source ? METRIC_DESCRIPTIONS[source] : "";
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2.5 border-b border-border/30 last:border-0 group hover:bg-primary/5 transition-colors px-2 -mx-2">
      <div className="text-right font-mono text-xs sm:text-sm {isAWinner ? "text-primary font-bold" : "text-muted-foreground"}">
        {fmt(valA || 0)}
      </div>
      <div className="flex items-center justify-center gap-1.5 w-24 sm:w-40">
        <div className="text-[9px] sm:text-[10px] font-mono uppercase text-muted-foreground/40 text-center tracking-tighter group-hover:text-muted-foreground transition-colors truncate">
          {label}
        </div>
        {desc && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-2.5 h-2.5 text-muted-foreground/20 group-hover:text-primary/40 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-[10px] uppercase tracking-wider">Source: {desc}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {source && (
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-primary/60 border border-primary" />
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{ background: BRAVO_COLOR }} />
          <span className="text-xs text-muted-foreground font-mono">Bravo</span>
        </div>
      </div>
      <div className="text-left font-mono text-xs sm:text-sm {isBWinner ? "text-primary font-bold" : "text-muted-foreground"}">
        {fmt(valB || 0)}
      </div>
    </div>
  );
};

export default function Index() {
  const handleWeightChange = (field: keyof typeof weights, value: number) => {
    const newWeights = { ...weights };
    newWeights[field] = value / 100;
    // Normalize so they still sum to 1    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    const normalized = {} as any;
    Object.entries(newWeights).forEach(([k, v]) => {
      normalized[k] = v / total;
    });
    setWeights(normalized);
  };

  const exportButtonLabel = "Export Diagram";
  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Operational Status: Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tighter uppercase italic">Strategic Assessment</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">Head-to‑Head Force Comparison Matrix</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto bg-card/50 p-3 border border-border/50 backdrop-blur-sm">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelected([selected[1], selected[0]])}
              className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-none border-border/50 hover:border-primary/50 hover:text-primary"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <CountrySelector
              label="Force Alpha"
              value={selected[0]}
              onChange={(val) => setSelected([val, selected[1]])}
              className="w-full sm:w-48 xl:w-56"
            />
            <CountrySelector
              label="Force Bravo"
              value={selected[1]}
              onChange={(val) => setSelected([selected[0], val])}
              className="w-full sm:w-48 xl:w-56"
            />
          </div>
        </header>

        {/* Filter Panel */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full flex justify-center items-center gap-2"
            onClick={() => setFilterPanelOpen((o) => !o)}
          >
            <Info className="w-5 h-5" />
            <span className="text-sm font-mono text-muted-foreground">Filters</span>
          </Button>
        </div>

        {filterPanelOpen && (
          <div className="hidden lg:block border border-border/50 bg-card/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-xs uppercase tracking-wider text-primary mb-2">
              Filter Nations
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20" />
                <label className="text-[9px] font-mono uppercase text-primary mr-1">Continent</label>
                <Select>
                  <SelectTrigger className="font-medium bg-background/50 h-10 rounded-none border border-border px-2.5 py-2.5 text-sm transition-colors">
                    <SelectValue placeholder="All continents" />
                  </SelectTrigger>
                  <SelectContent>
                    {["North America", "Europe", "Asia", "Africa", "South America", "Oceania"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20" />
                <label className="text-[9px] font-mono uppercase text-primary mr-1">Alliance</label>
                <Select>
                  <SelectTrigger className="font-medium bg-background/50 h-10 rounded-none border border-border px-2.5 py-2.5 text-sm transition-colors">
                    <SelectValue placeholder="All alliances" />
                  </SelectTrigger>
                  <SelectContent>
                    {["NATO", "AUKUS", "SCO", "CSTO", "Five Eyes", "None"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20" />
                <label className="text-[9px] font-mono uppercase text-primary mr-1">Region</label>
                <Select>
                  <SelectTrigger className="font-medium bg-background/50 h-10 rounded-none border border-border px-2.5 py-2.5 text-sm transition-colors">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    {["North America", "Europe", "Asia", "Africa", "South America", "Oceania"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground uppercase tracking-wider">
              <span className="mr-2">Applied filters will limit the nation list used for comparison.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ... existing comparison cards ... */}
          {/* Radar Chart Card */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-primary">Military Strength Index</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countries[0]?.name ?? "A"}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono leading-none truncate">{scoreA?.totalScore?.toFixed(2) ?? "0.00"}</div>
                  </div>
                  <div className="text-right space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countries[1]?.name ?? "B"}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono text-primary leading-none truncate">{scoreB?.totalScore?.toFixed(2) ?? "0.00"}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-none overflow-hidden flex border border-border/50">
                    <div
                      className="bg-foreground h-full transition-all duration-500"
                      style={{
                        width: `${(scoreA?.totalScore / (scoreA?.totalScore + scoreB?.totalScore)) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{
                        width: `${(scoreB?.totalScore / (scoreA?.totalScore + scoreB?.totalScore)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                    <span>Force A Share</span>
                    <span>Force B Share</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30 rounded-none">
              <CardHeader className="bg-accent/5 border-b border-border/50">
                <CardTitle className="text-xs font-mono uppercase tracking-wider">Capability Matrix</CardTitle>
              </CardHeader>
              <CardContent className="h-[340px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis                      dataKey="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }}
                    />
                    <Radar name={countries[0]?.name ?? "A"} dataKey="A" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={countries[1]?.name ?? "B"} dataKey="B" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        borderRadius: "0px",
                      }}
                      itemStyle={{ textTransform: "uppercase", fontWeight: "bold" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-foreground" />
                    {countries[0]?.name ?? "A"}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-primary" />
                    {countries[1]?.name ?? "B"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Export / Share Button */}
        <div className="flex justify-end mt-4">
          <Button            variant="outline"
            className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30"
            onClick={exportAsImage}
          >
            {exportButtonLabel}
            <Swords className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}