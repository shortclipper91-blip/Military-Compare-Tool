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
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Users, Plane, Target, Anchor, DollarSign, Zap, ArrowRightLeft } from "lucide-react";

export default function Index() {
  const [selected, setSelected] = useState(["US", "CN"]);
  const countries = useMemo(() => [
    COUNTRIES_DATA.find(c => c.code === selected[0])!,
    COUNTRIES_DATA.find(c => c.code === selected[1])!
  ], [selected]);

  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const scoreA = scores.find(s => s.code === selected[0])!;
  const scoreB = scores.find(s => s.code === selected[1])!;

  const radarData = [
    { category: "Manpower", A: scoreA.categories.manpower, B: scoreB.categories.manpower },
    { category: "Air Power", A: scoreA.categories.airPower, B: scoreB.categories.airPower },
    { category: "Ground", A: scoreA.categories.groundForces, B: scoreB.categories.groundForces },
    { category: "Naval", A: scoreA.categories.navalForces, B: scoreB.categories.navalForces },
    { category: "Economy", A: scoreA.categories.economy, B: scoreB.categories.economy },
  ];

  const StatRow = ({ label, valA, valB, format = "compact" }: any) => {
    const isAWinner = valA > valB;
    const isBWinner = valB > valA;
    const fmt = (v: number) => format === "currency" ? formatCurrency(v) : formatCompact(v);
    
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2 border-b border-border/50 last:border-0">
        <div className={`text-right font-mono text-sm ${isAWinner ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {fmt(valA)}
        </div>
        <div className="text-[10px] font-mono uppercase text-muted-foreground/60 w-32 text-center tracking-tighter">
          {label}
        </div>
        <div className={`text-left font-mono text-sm ${isBWinner ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {fmt(valB)}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Strategic Assessment</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Head-to-Head Force Comparison Matrix</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <CountrySelector 
                value={selected[0]} 
                onChange={(val) => setSelected([val, selected[1]])} 
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelected([selected[1], selected[0]])} className="shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1 md:w-64">
              <CountrySelector 
                value={selected[1]} 
                onChange={(val) => setSelected([selected[0], val])} 
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FlagIcon code={countries[0].code} size={30} />
                  <span className="font-bold uppercase tracking-tighter">{countries[0].name}</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">VS</div>
                <div className="flex items-center gap-3">
                  <span className="font-bold uppercase tracking-tighter">{countries[1].name}</span>
                  <FlagIcon code={countries[1].code} size={30} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <section>
                <h3 className="text-[10px] font-mono uppercase text-primary mb-4 flex items-center gap-2">
                  <Users className="w-3 h-3" /> Personnel & Manpower
                </h3>
                <StatRow label="Active Personnel" valA={countries[0].metrics.activePersonnel} valB={countries[1].metrics.activePersonnel} />
                <StatRow label="Reserve Forces" valA={countries[0].metrics.reservePersonnel} valB={countries[1].metrics.reservePersonnel} />
                <StatRow label="Total Population" valA={countries[0].metrics.population} valB={countries[1].metrics.population} />
              </section>

              <section>
                <h3 className="text-[10px] font-mono uppercase text-primary mb-4 flex items-center gap-2">
                  <Plane className="w-3 h-3" /> Air Superiority
                </h3>
                <StatRow label="Total Aircraft" valA={countries[0].metrics.aircraft} valB={countries[1].metrics.aircraft} />
                <StatRow label="Fighter Jets" valA={countries[0].metrics.fighterJets} valB={countries[1].metrics.fighterJets} />
                <StatRow label="Attack Helos" valA={countries[0].metrics.attackHelicopters} valB={countries[1].metrics.attackHelicopters} />
              </section>

              <section>
                <h3 className="text-[10px] font-mono uppercase text-primary mb-4 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Ground Combat
                </h3>
                <StatRow label="Main Battle Tanks" valA={countries[0].metrics.tanks} valB={countries[1].metrics.tanks} />
                <StatRow label="Armored Vehicles" valA={countries[0].metrics.armoredVehicles} valB={countries[1].metrics.armoredVehicles} />
              </section>

              <section>
                <h3 className="text-[10px] font-mono uppercase text-primary mb-4 flex items-center gap-2">
                  <Anchor className="w-3 h-3" /> Naval Dominance
                </h3>
                <StatRow label="Total Vessels" valA={countries[0].metrics.navalVessels} valB={countries[1].metrics.navalVessels} />
                <StatRow label="Submarines" valA={countries[0].metrics.submarines} valB={countries[1].metrics.submarines} />
                <StatRow label="Aircraft Carriers" valA={countries[0].metrics.aircraftCarriers} valB={countries[1].metrics.aircraftCarriers} />
              </section>

              <section>
                <h3 className="text-[10px] font-mono uppercase text-primary mb-4 flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Strategic Assets
                </h3>
                <StatRow label="Nuclear Warheads" valA={countries[0].metrics.nuclearWarheads} valB={countries[1].metrics.nuclearWarheads} />
                <StatRow label="Defense Budget" valA={countries[0].metrics.defenseBudgetUsd} valB={countries[1].metrics.defenseBudgetUsd} format="currency" />
              </section>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-primary">Military Strength Index</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{countries[0].name}</div>
                    <div className="text-4xl font-black font-mono">{scoreA.totalScore.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{countries[1].name}</div>
                    <div className="text-4xl font-black font-mono text-primary">{scoreB.totalScore.toFixed(2)}</div>
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-foreground h-full" style={{ width: `${(scoreA.totalScore / (scoreA.totalScore + scoreB.totalScore)) * 100}%` }} />
                  <div className="bg-primary h-full" style={{ width: `${(scoreB.totalScore / (scoreA.totalScore + scoreB.totalScore)) * 100}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/30">
              <CardHeader>
                <CardTitle className="text-xs font-mono uppercase tracking-widest">Capability Matrix</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }} />
                    <Radar name={countries[0].name} dataKey="A" stroke="hsl(var(--foreground))" fill="hsl(var(--foreground))" fillOpacity={0.3} />
                    <Radar name={countries[1].name} dataKey="B" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "12px" }} />
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