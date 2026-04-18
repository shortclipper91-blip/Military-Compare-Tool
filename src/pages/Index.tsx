"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores, computeStrengthIndex, scoreToColor } from "@/lib/scoring";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
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
  Zap,   ArrowRightLeft, 
  ShieldCheck, 
  Info,
  Database } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import METRIC_DESCRIPTIONS from "@/lib/metricDescriptions";
import { cn } from "@/lib/utils";
import "../extra.css";

const BRAVO_COLOR = "hsl(var(--chart-4))";
const PRIMARY_COLOR = "hsl(var(--primary))";

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
  const fmt = (v: number) => {
    if (format === "currency") return formatCurrency(v);
    if (format === "number") return formatNumber(v);
    return formatCompact(v);
  };
  
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
                <p className="font-mono text-[10px] uppercase tracking-wider max-w-[200px]">{desc}</p>
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

  // -----------------------------------------------------------------
  // 1️⃣  Compute a *consistent* strength index for every country.
  // -----------------------------------------------------------------
  const maxVals = {
    personnel: 0,
    aircraft: 0,
    naval: 0,
    budget: 0,
  };
  COUNTRIES_DATA.forEach(c => {
    const p = (c.metrics.activePersonnel ?? 0) + (c.metrics.reservePersonnel ?? 0);
    const a = c.metrics.aircraft ?? 0;
    const n = (c.metrics.navalVessels ?? 0) +
              (c.metrics.submarines ?? 0) * 2 +
              (c.metrics.aircraftCarriers ?? 0) * 10;
    const b = c.metrics.defenseBudgetUsd ?? 0;
    maxVals.personnel = Math.max(maxVals.personnel, p);
    maxVals.aircraft = Math.max(maxVals.aircraft, a);
    maxVals.naval = Math.max(maxVals.naval, n);
    maxVals.budget = Math.max(maxVals.budget, b);
  });

  const indexed = COUNTRIES_DATA.map(c => {
    const { score } = computeStrengthIndex(c, maxVals);
    return { ...c, strengthScore: score };
  });

  const scoreA = useMemo(() => {
    return indexed.find(c => c.code === selected[0]);
  }, [selected, indexed]);
  const scoreB = useMemo(() => {
    return indexed.find(c => c.code === selected[1]);
  }, [selected, indexed]);

  // -----------------------------------------------------------------
  // 2️⃣  Radar‑chart data (category breakdown)
  // -----------------------------------------------------------------
  const radarData = useMemo(() => {
    if (!scoreA || !scoreB) return [];
    return [
      { category: "Manpower", A: scoreA.strengthScore, B: scoreB.strengthScore },
      { category: "Air Power", A: scoreA?.categories?.airPower ?? 0, B: scoreB?.categories?.airPower ?? 0 },
      { category: "Ground", A: scoreA?.categories?.groundForces ?? 0, B: scoreB?.categories?.groundForces ?? 0 },
      { category: "Naval", A: scoreA?.categories?.navalForces ?? 0, B: scoreB?.categories?.navalForces ?? 0 },
      { category: "Economy", A: scoreA?.categories?.economy ?? 0, B: scoreB?.categories?.economy ?? 0 },
    ];
  }, [scoreA, scoreB]);

  // -----------------------------------------------------------------
  // 3️⃣  Render
  // -----------------------------------------------------------------
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header – unchanged */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Operational Status: Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tighter uppercase italic">
              Strategic Assessment
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">
              Head‑to‑Head Force Comparison Matrix
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 w-full lg:w-auto bg-card/50 p-3 border border-border/50 backdrop-blur-sm">
            <CountrySelector
              label="Force Alpha"
              value={selected[0]}
              onChange={(val) => setSelected([val, selected[1]])}
              countries={COUNTRIES_DATA}
              className="w-full sm:w-48 xl:w-56"
            />
            <div className="flex items-center justify-center pb-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelected([selected[1], selected[0]])}
                className="shrink-0 h-10 w-10 rounded-none border-border/50 hover:border-primary/50 hover:text-primary"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </Button>
            </div>
            <CountrySelector
              label="Force Bravo"
              value={selected[1]}
              onChange={(val) => setSelected([selected[0], val])}
              countries={COUNTRIES_DATA}
              className="w-full sm:w-48 xl:w-56"
            />
          </div>
        </header>

        {/* Main comparison cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column – detailed metrics */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 bg-card/30">
              <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xs font-mono uppercase tracking-widest">Detailed Metrics</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1 hover:text-primary transition-colors">
                          <Database className="w-3 h-3 text-muted-foreground/50" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border p-3">
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Intelligence Sources</p>
                          <ul className="space-y-1 text-muted-foreground text-[9px] font-mono uppercase">
                            <li>• IISS Military Balance 2024</li>
                            <li>• SIPRI Arms Transfers Database</li>
                            <li>• Global Firepower Index 2024</li>
                            <li>• FAS Nuclear Notebook 2023</li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <FlagIcon code={scoreA?.code ?? ""} size={16} />
                    <span className={cn(isAWinner && "text-primary font-bold")}>{scoreA?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <FlagIcon code={scoreB?.code ?? ""} size={16} />
                    <span className={cn(isBWinner && "font-bold")} style={isBWinner ? { color: BRAVO_COLOR } : {}}>
                      {scoreB?.name}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Metric rows – unchanged except we now use the consistent strengthScore */}
                <div>
                  <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Manpower
                  </h3>
                  <StatRow label="Active Personnel" valA={scoreA?.metrics.activePersonnel} valB={scoreB?.metrics.activePersonnel} metricKey="activePersonnel" />
                  <StatRow label="Reserve Forces" valA={scoreA?.metrics.reservePersonnel} valB={scoreB?.metrics.reservePersonnel} metricKey="reservePersonnel" />
                  <StatRow label="Paramilitary" valA={scoreA?.metrics.paramilitary} valB={scoreB?.metrics.paramilitary} metricKey="paramilitary" />
                </div>

                <div>
                  <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2 flex items-center gap-2">
                    <Plane className="w-3 h-3" /> Air Power
                  </h3>
                  <StatRow label="Total Aircraft" valA={scoreA?.metrics.aircraft} valB={scoreB?.metrics.aircraft} metricKey="aircraft" />
                  <StatRow label="Fighter Jets" valA={scoreA?.metrics.fighterJets} valB={scoreB?.metrics.fighterJets} metricKey="fighterJets" />
                  <StatRow label="Attack Helicopters" valA={scoreA?.metrics.attackHelicopters} valB={scoreB?.metrics.attackHelicopters} metricKey="attackHelicopters" />
                </div>

                <div>
                  <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Ground Forces
                  </h3>
                  <StatRow label="Main Battle Tanks" valA={scoreA?.metrics.tanks} valB={scoreB?.metrics.tanks} metricKey="tanks" />
                  <StatRow label="Armored Vehicles" valA={scoreA?.metrics.armoredVehicles} valB={scoreB?.metrics.armoredVehicles} metricKey="armoredVehicles" />
                  <StatRow label="Artillery Units" valA={scoreA?.metrics.selfPropelledArtillery} valB={scoreB?.metrics.selfPropelledArtillery} metricKey="selfPropelledArtillery" />
                </div>

                <div>
                  <h3 className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-widest border-l-2 border-primary pl-2 flex items-center gap-2">
                    <Anchor className="w-3 h-3" /> Naval Forces
                  </h3>
                  <StatRow label="Total Vessels" valA={scoreA?.metrics.navalVessels} valB={scoreB?.metrics.navalVessels} metricKey="navalVessels" />
                  <StatRow label="Submarines" valA={scoreA?.metrics.submarines} valB={scoreB?.metrics.submarines} metricKey="submarines" />
                  <StatRow label="Destroyers" valA={scoreA?.metrics.destroyers} valB={scoreB?.metrics.destroyers} metricKey="destroyers" />
                  <StatRow label="Frigates" valA={scoreA?.metrics.frigates} valB={scoreB?.metrics.frigates} metricKey="frigates" />
                  <StatRow label="Aircraft Carriers" valA={scoreA?.metrics.aircraftCarriers} valB={scoreB?.metrics.aircraftCarriers} metricKey="aircraftCarriers" />
                  <StatRow label="Nuclear Warheads" valA={scoreA?.metrics.nuclearWarheads} valB={scoreB?.metrics.nuclearWarheads} metricKey="nuclearWarheads" format="number" />
                  <StatRow label="Defense Budget" valA={scoreA?.metrics.defenseBudgetUsd} valB={scoreB?.metrics.defenseBudgetUsd} format="currency" metricKey="defenseBudgetUsd" />
                  <StatRow label="GDP" valA={scoreA?.metrics.gdpUsd} valB={scoreB?.metrics.gdpUsd} format="currency" metricKey="gdpUsd" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column – index bar + radar chart */}
          <div className="space-y-6">
            {/* Strength‑Index bar – now coloured properly */}
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
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{scoreA?.name}</div>
                    <div className={cn(
                      "text-2xl sm:text-3xl xl:text-4xl font-black font-mono leading-none truncate",
                      isAWinner ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {scoreA?.strengthScore?.toFixed(2) ?? "0.00"}
                    </div>
                  </div>
                  <div className="text-right space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{scoreB?.name}</div>
                    <div className={cn(
                      "text-2xl sm:text-3xl xl:text-4xl font-black font-mono leading-none truncate",
                      isBWinner ? "" : "text-muted-foreground"
                    )} style={isBWinner ? { color: BRAVO_COLOR } : {}}>
                      {scoreB?.strengthScore?.toFixed(2) ?? "0.00"}
                    </div>
                  </div>
                </div>
                {/* coloured bar – uses the same colour logic as the radar chart */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-none overflow-hidden flex border border-border/50">
                    <div className="bg-primary h-full transition-all duration-500"
                      style={{
                        width: `${((scoreA?.strengthScore ?? 0) / ((scoreA?.strengthScore ?? 0) + (scoreB?.strengthScore ?? 0) || 1)) * 100}%`,
                        backgroundColor: PRIMARY_COLOR,
                      }}
                    />
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${((scoreB?.strengthScore ?? 0) / ((scoreA?.strengthScore ?? 0) + (scoreB?.strengthScore ?? 0) || 1)) * 100}%`,
                        backgroundColor: BRAVO_COLOR,
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

            {/* Radar chart – use distinct colours */}
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
                      tick={{
                        fill: "#e5e7eb",
                        fontSize: 10,
                        fontFamily: "monospace",
                        fontWeight: "bold",
                      }}
                    />
                    {/* Alpha line – gold */}
                    <Radar 
                      name={scoreA?.name ?? "Alpha"} 
                      dataKey="A" 
                      stroke={PRIMARY_COLOR} 
                      fill={PRIMARY_COLOR} 
                      fillOpacity={0.5} 
                      strokeWidth={3}                     />
                    {/* Bravo line – orange */}
                    <Radar 
                      name={scoreB?.name ?? "Bravo"} 
                      dataKey="B" 
                      stroke={BRAVO_COLOR} 
                      fill={BRAVO_COLOR} 
                      fillOpacity={0.3} 
                      strokeWidth={3} 
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        color: "white",
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