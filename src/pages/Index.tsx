"use client";

import React, { useState, useMemo } from "react";
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
import { 
  Users, 
  Plane, 
  Target, 
  Anchor, 
  DollarSign, 
  Zap, 
  ArrowRightLeft, 
  ShieldCheck, 
  Info,
  Swords
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import METRIC_DESCRIPTIONS from "@/lib/metricDescriptions";
import { cn } from "@/lib/utils";

const BRAVO_COLOR = "hsl(var(--chart-4))";

const StatRow = ({
  label,
  valA,
  valB,
  format = "compact",
  metricKey,
}: {
  label: string;
  valA: number | null | undefined;
  valB: number | null | undefined;
  format?: "compact" | "currency" | "number";
  metricKey?: string;
}) => {
  const isAWinner = (valA || 0) > (valB || 0);
  const isBWinner = (valB || 0) > (valA || 0);
  const fmt = (v: number) =>
    format === "currency"
      ? formatCurrency(v)
      : formatCompact(v);
  
  const desc = metricKey ? METRIC_DESCRIPTIONS[metricKey] : "";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2.5 border-b border-border/30 last:border-0 group hover:bg-primary/5 transition-colors px-2 -mx-2">
      <div className={cn(
        "text-right font-mono text-xs sm:text-sm",
        isAWinner ? "text-primary font-bold" : "text-muted-foreground"
      )}>
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
                <p className="font-mono text-[10px] uppercase tracking-wider">{desc}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={cn(
        "text-left font-mono text-xs sm:text-sm",
        isBWinner ? "text-primary font-bold" : "text-muted-foreground"
      )} style={isBWinner ? { color: BRAVO_COLOR } : {}}>
        {fmt(valB || 0)}
      </div>
    </div>
  );
};

export default function Index() {
  const [selected, setSelected] = useState(["US", "CN"]);
  const [filterValues, setFilterValues] = useState({
    continent: "",
    alliance: "",
    region: "",
  });

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

  const countryA = useMemo(() => COUNTRIES_DATA.find(c => c.code === selected[0]), [selected]);
  const countryB = useMemo(() => COUNTRIES_DATA.find(c => c.code === selected[1]), [selected]);

  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const scoreA = useMemo(() => scores.find((s) => s.code === selected[0]), [scores, selected]);
  const scoreB = useMemo(() => scores.find((s) => s.code === selected[1]), [scores, selected]);

  const radarData = useMemo(() => {
    if (!scoreA || !scoreB) return [];
    return [
      { category: "Manpower", A: scoreA.categories.manpower, B: scoreB.categories.manpower },
      { category: "Air Power", A: scoreA.categories.airPower, B: scoreB.categories.airPower },
      { category: "Ground", A: scoreA.categories.groundForces, B: scoreB.categories.groundForces },
      { category: "Naval", A: scoreA.categories.navalForces, B: scoreB.categories.navalForces },
      { category: "Economy", A: scoreA.categories.economy, B: scoreB.categories.economy },
    ];
  }, [scoreA, scoreB]);

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
              countries={filteredCountries}
              className="w-full sm:w-48 xl:w-56"
            />
            <CountrySelector
              label="Force Bravo"
              value={selected[1]}
              onChange={(val) => setSelected([selected[0], val])}
              countries={filteredCountries}
              className="w-full sm:w-48 xl:w-56"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 bg-card/30">
              <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-widest">Detailed Metrics</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-foreground" /> {countryA?.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-primary" /> {countryB?.name}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2">Manpower</h3>
                    <StatRow label="Active Personnel" valA={countryA?.metrics.activePersonnel} valB={countryB?.metrics.activePersonnel} metricKey="activePersonnel" />
                    <StatRow label="Reserve Forces" valA={countryA?.metrics.reservePersonnel} valB={countryB?.metrics.reservePersonnel} metricKey="reservePersonnel" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2">Air Power</h3>
                    <StatRow label="Total Aircraft" valA={countryA?.metrics.aircraft} valB={countryB?.metrics.aircraft} metricKey="aircraft" />
                    <StatRow label="Fighter Jets" valA={countryA?.metrics.fighterJets} valB={countryB?.metrics.fighterJets} metricKey="fighterJets" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2">Naval Forces</h3>
                    <StatRow label="Total Vessels" valA={countryA?.metrics.navalVessels} valB={countryB?.metrics.navalVessels} metricKey="navalVessels" />
                    <StatRow label="Submarines" valA={countryA?.metrics.submarines} valB={countryB?.metrics.submarines} metricKey="submarines" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2">Economy</h3>
                    <StatRow label="Defense Budget" valA={countryA?.metrics.defenseBudgetUsd} valB={countryB?.metrics.defenseBudgetUsd} format="currency" metricKey="defenseBudgetUsd" />
                    <StatRow label="GDP" valA={countryA?.metrics.gdpUsd} valB={countryB?.metrics.gdpUsd} format="currency" metricKey="gdpUsd" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countryA?.name}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono leading-none truncate">{scoreA?.totalScore?.toFixed(2) ?? "0.00"}</div>
                  </div>
                  <div className="text-right space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countryB?.name}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono text-primary leading-none truncate" style={{ color: BRAVO_COLOR }}>{scoreB?.totalScore?.toFixed(2) ?? "0.00"}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-none overflow-hidden flex border border-border/50">
                    <div
                      className="bg-foreground h-full transition-all duration-500"
                      style={{
                        width: `${((scoreA?.totalScore || 0) / ((scoreA?.totalScore || 0) + (scoreB?.totalScore || 0) || 1)) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${((scoreB?.totalScore || 0) / ((scoreA?.totalScore || 0) + (scoreB?.totalScore || 0) || 1)) * 100}%`,
                        backgroundColor: BRAVO_COLOR
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

            <Card className="border-border/50 bg-card/30 rounded-none radar-chart-container">
              <CardHeader className="bg-accent/5 border-b border-border/50">
                <CardTitle className="text-xs font-mono uppercase tracking-wider">Capability Matrix</CardTitle>
              </CardHeader>
              <CardContent className="h-[340px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }}
                    />
                    <Radar name={countryA?.name} dataKey="A" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={countryB?.name} dataKey="B" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}