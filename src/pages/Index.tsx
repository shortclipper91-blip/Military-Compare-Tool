"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Users, Plane, Target, Anchor, DollarSign, Zap, ArrowRightLeft, ShieldCheck, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Index() {
  const [selected, setSelected] = useState(["US", "CN"]);
  
  const countries = useMemo(() => [
    COUNTRIES_DATA.find(c => c.code === selected[0]) || COUNTRIES_DATA[0],
    COUNTRIES_DATA.find(c => c.code === selected[1]) || COUNTRIES_DATA[1]
  ], [selected]);

  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const scoreA = scores.find(s => s.code === selected[0]) || scores[0];
  const scoreB = scores.find(s => s.code === selected[1]) || scores[1];

  const radarData = [
    { category: "Manpower", A: scoreA.categories.manpower, B: scoreB.categories.manpower },
    { category: "Air Power", A: scoreA.categories.airPower, B: scoreB.categories.airPower },
    { category: "Ground", A: scoreA.categories.groundForces, B: scoreB.categories.groundForces },
    { category: "Naval", A: scoreA.categories.navalForces, B: scoreB.categories.navalForces },
    { category: "Economy", A: scoreA.categories.economy, B: scoreB.categories.economy },
  ];

  const StatRow = ({ label, valA, valB, format = "compact", source }: any) => {
    const isAWinner = (valA || 0) > (valB || 0);
    const isBWinner = (valB || 0) > (valA || 0);
    const fmt = (v: number) => format === "currency" ? formatCurrency(v) : formatCompact(v);
    
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2.5 border-b border-border/30 last:border-0 group hover:bg-primary/5 transition-colors px-2 -mx-2">
        <div className={`text-right font-mono text-xs sm:text-sm ${isAWinner ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {fmt(valA || 0)}
        </div>
        <div className="flex items-center justify-center gap-1.5 w-24 sm:w-40">
          <div className="text-[9px] sm:text-[10px] font-mono uppercase text-muted-foreground/40 text-center tracking-tighter group-hover:text-muted-foreground transition-colors truncate">
            {label}
          </div>
          {source && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-2.5 h-2.5 text-muted-foreground/20 group-hover:text-primary/40 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-mono text-[10px] uppercase tracking-wider">Source: {source}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className={`text-left font-mono text-xs sm:text-sm ${isBWinner ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {fmt(valB || 0)}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Operational Status: Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tighter uppercase italic leading-none">Strategic Assessment</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest opacity-70">Head-to-Head Force Comparison Matrix</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto bg-card/50 p-3 border border-border/50 backdrop-blur-sm">
            <CountrySelector 
              label="Force Alpha"
              value={selected[0]} 
              onChange={(val) => setSelected([val, selected[1]])} 
              className="w-full sm:w-48 xl:w-56"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelected([selected[1], selected[0]])} 
              className="shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-none border-border/50 hover:border-primary/50 hover:text-primary"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <CountrySelector 
              label="Force Bravo"
              value={selected[1]} 
              onChange={(val) => setSelected([selected[0], val])} 
              className="w-full sm:w-48 xl:w-56"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-sm rounded-none">
            <CardHeader className="border-b border-border/50 bg-accent/10">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="p-1 border border-border/50 bg-background shrink-0">
                    <FlagIcon code={countries[0].code} size={24} className="sm:w-8" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-black uppercase tracking-tighter text-sm sm:text-base xl:text-lg leading-none truncate">{countries[0].name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase mt-1 truncate">Sector: {countries[0].region}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-6 sm:h-8 w-[1px] bg-border/50" />
                  <div className="text-[10px] font-mono text-primary font-bold my-1">VS</div>
                  <div className="h-6 sm:h-8 w-[1px] bg-border/50" />
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-right min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-black uppercase tracking-tighter text-sm sm:text-base xl:text-lg leading-none truncate">{countries[1].name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase mt-1 truncate">Sector: {countries[1].region}</span>
                  </div>
                  <div className="p-1 border border-border/50 bg-background shrink-0">
                    <FlagIcon code={countries[1].code} size={24} className="sm:w-8" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/50" />
                  <h3 className="text-[10px] font-mono uppercase text-primary flex items-center gap-2 shrink-0 tracking-[0.2em]">
                    <Users className="w-3 h-3" /> Personnel & Manpower
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/50" />
                </div>
                <StatRow label="Active Personnel" valA={countries[0].metrics.activePersonnel} valB={countries[1].metrics.activePersonnel} source={countries[0].sources?.personnel} />
                <StatRow label="Reserve Forces" valA={countries[0].metrics.reservePersonnel} valB={countries[1].metrics.reservePersonnel} source={countries[0].sources?.personnel} />
                <StatRow label="Paramilitary" valA={countries[0].metrics.paramilitary} valB={countries[1].metrics.paramilitary} source={countries[0].sources?.personnel} />
                <StatRow label="Total Population" valA={countries[0].metrics.population} valB={countries[1].metrics.population} source={countries[0].sources?.economy} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/50" />
                  <h3 className="text-[10px] font-mono uppercase text-primary flex items-center gap-2 shrink-0 tracking-[0.2em]">
                    <Plane className="w-3 h-3" /> Air Superiority
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/50" />
                </div>
                <StatRow label="Total Aircraft" valA={countries[0].metrics.aircraft} valB={countries[1].metrics.aircraft} source={countries[0].sources?.equipment} />
                <StatRow label="Fighter Jets" valA={countries[0].metrics.fighterJets} valB={countries[1].metrics.fighterJets} source={countries[0].sources?.equipment} />
                <StatRow label="Attack Helos" valA={countries[0].metrics.attackHelicopters} valB={countries[1].metrics.attackHelicopters} source={countries[0].sources?.equipment} />
                <StatRow label="Transport Helos" valA={countries[0].metrics.transportHelicopters} valB={countries[1].metrics.transportHelicopters} source={countries[0].sources?.equipment} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/50" />
                  <h3 className="text-[10px] font-mono uppercase text-primary flex items-center gap-2 shrink-0 tracking-[0.2em]">
                    <Target className="w-3 h-3" /> Ground Combat
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/50" />
                </div>
                <StatRow label="Main Battle Tanks" valA={countries[0].metrics.tanks} valB={countries[1].metrics.tanks} source={countries[0].sources?.equipment} />
                <StatRow label="Armored Vehicles" valA={countries[0].metrics.armoredVehicles} valB={countries[1].metrics.armoredVehicles} source={countries[0].sources?.equipment} />
                <StatRow label="SP Artillery" valA={countries[0].metrics.selfPropelledArtillery} valB={countries[1].metrics.selfPropelledArtillery} source={countries[0].sources?.equipment} />
                <StatRow label="Rocket Projectors" valA={countries[0].metrics.rocketProjectors} valB={countries[1].metrics.rocketProjectors} source={countries[0].sources?.equipment} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/50" />
                  <h3 className="text-[10px] font-mono uppercase text-primary flex items-center gap-2 shrink-0 tracking-[0.2em]">
                    <Anchor className="w-3 h-3" /> Naval Dominance
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/50" />
                </div>
                <StatRow label="Total Vessels" valA={countries[0].metrics.navalVessels} valB={countries[1].metrics.navalVessels} source={countries[0].sources?.equipment} />
                <StatRow label="Submarines" valA={countries[0].metrics.submarines} valB={countries[1].metrics.submarines} source={countries[0].sources?.equipment} />
                <StatRow label="Destroyers" valA={countries[0].metrics.destroyers} valB={countries[1].metrics.destroyers} source={countries[0].sources?.equipment} />
                <StatRow label="Frigates" valA={countries[0].metrics.frigates} valB={countries[1].metrics.frigates} source={countries[0].sources?.equipment} />
                <StatRow label="Aircraft Carriers" valA={countries[0].metrics.aircraftCarriers} valB={countries[1].metrics.aircraftCarriers} source={countries[0].sources?.equipment} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/50" />
                  <h3 className="text-[10px] font-mono uppercase text-primary flex items-center gap-2 shrink-0 tracking-[0.2em]">
                    <Zap className="w-3 h-3" /> Strategic Assets
                  </h3>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/50" />
                </div>
                <StatRow label="Nuclear Warheads" valA={countries[0].metrics.nuclearWarheads} valB={countries[1].metrics.nuclearWarheads} source={countries[0].sources?.nuclear} />
                <StatRow label="Defense Budget" valA={countries[0].metrics.defenseBudgetUsd} valB={countries[1].metrics.defenseBudgetUsd} format="currency" source={countries[0].sources?.budget} />
                <StatRow label="GDP (USD)" valA={countries[0].metrics.gdpUsd} valB={countries[1].metrics.gdpUsd} format="currency" source={countries[0].sources?.economy} />
              </section>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 rounded-none relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <ShieldCheck className="w-24 h-24" />
              </div>
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Military Strength Index</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countries[0].name}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono leading-none truncate">{scoreA.totalScore.toFixed(2)}</div>
                  </div>
                  <div className="text-right space-y-1 min-w-0">
                    <div className="text-[9px] sm:text-[10px] font-mono text-muted-foreground uppercase tracking-wider truncate">{countries[1].name}</div>
                    <div className="text-2xl sm:text-3xl xl:text-4xl font-black font-mono text-primary leading-none truncate">{scoreB.totalScore.toFixed(2)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded-none overflow-hidden flex border border-border/50">
                    <div className="bg-foreground h-full transition-all duration-500" style={{ width: `${(scoreA.totalScore / (scoreA.totalScore + scoreB.totalScore)) * 100}%` }} />
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(scoreB.totalScore / (scoreA.totalScore + scoreB.totalScore)) * 100}%` }} />
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
                <CardTitle className="text-xs font-mono uppercase tracking-widest">Capability Matrix</CardTitle>
              </CardHeader>
              <CardContent className="h-[340px] pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace", fontWeight: "bold" }} />
                    <Radar name={countries[0].name} dataKey="A" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={countries[1].name} dataKey="B" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: "12px", fontFamily: "monospace", borderRadius: "0px" }}
                      itemStyle={{ textTransform: "uppercase", fontWeight: "bold" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-foreground" /> {countries[0].name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-2 h-2 bg-primary" /> {countries[1].name}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}