import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { scoreCountry, getMaxValues, type CategoryWeights, type Scenario } from "@/lib/scoring";
import { formatCompact, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { ShieldAlert, Users, Plane, Target, Anchor, DollarSign, Zap } from "lucide-react";

const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2, airPower: 0.2, groundForces: 0.2, navalForces: 0.2, economy: 0.1, logistics: 0.1,
};

export default function Index() {
  const [selected, setSelected] = useState(["US", "CN"]);
  const [scenario, setScenario] = useState<Scenario>("full");

  const countryA = COUNTRIES_DATA.find(c => c.code === selected[0])!;
  const countryB = COUNTRIES_DATA.find(c => c.code === selected[1])!;

  const maxVals = useMemo(() => getMaxValues(COUNTRIES_DATA), []);
  const scoreA = useMemo(() => scoreCountry(countryA, DEFAULT_WEIGHTS, scenario, maxVals), [countryA, scenario, maxVals]);
  const scoreB = useMemo(() => scoreCountry(countryB, DEFAULT_WEIGHTS, scenario, maxVals), [countryB, scenario, maxVals]);

  const radarData = [
    { category: "Manpower", A: scoreA.rawScores.manpower, B: scoreB.rawScores.manpower },
    { category: "Air Power", A: scoreA.rawScores.airPower, B: scoreB.rawScores.airPower },
    { category: "Ground", A: scoreA.rawScores.groundForces, B: scoreB.rawScores.groundForces },
    { category: "Naval", A: scoreA.rawScores.navalForces, B: scoreB.rawScores.navalForces },
    { category: "Economy", A: scoreA.rawScores.economy, B: scoreB.rawScores.economy },
    { category: "Logistics", A: scoreA.rawScores.logistics, B: scoreB.rawScores.logistics },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">Strategic Assessment</h1>
          <p className="text-muted-foreground text-sm">Head-to-head comparison of national military capabilities</p>
        </header>

        <Tabs value={scenario} onValueChange={(v: any) => setScenario(v)}>
          <TabsList className="w-full">
            <TabsTrigger value="full" className="flex-1">Full Spectrum</TabsTrigger>
            <TabsTrigger value="air" className="flex-1">Air Superiority</TabsTrigger>
            <TabsTrigger value="naval" className="flex-1">Naval Dominance</TabsTrigger>
            <TabsTrigger value="ground" className="flex-1">Ground War</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[scoreA, scoreB].map((s, i) => {
            const c = i === 0 ? countryA : countryB;
            const isWinner = s.totalScore > (i === 0 ? scoreB.totalScore : scoreA.totalScore);
            return (
              <Card key={c.code} className={`border-2 ${isWinner ? "border-primary bg-primary/5" : "border-border"}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <FlagIcon code={c.code} size={40} />
                      <div>
                        <h2 className="text-2xl font-bold">{c.name}</h2>
                        <p className="text-xs font-mono text-muted-foreground uppercase">{c.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase">Index Score</div>
                      <div className={`text-4xl font-bold font-mono ${isWinner ? "text-primary" : ""}`}>{s.totalScore.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-card/50">
          <CardHeader><CardTitle className="text-sm font-mono uppercase">Capability Matrix</CardTitle></CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Radar name={countryA.name} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Radar name={countryB.name} dataKey="B" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}