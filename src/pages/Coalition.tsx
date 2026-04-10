"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { COUNTRIES_DATA, Country } from "@/lib/countryData";
import { calculateScores, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { formatCompact } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Swords } from "lucide-react";

export default function Coalition() {
  const [teamA, setTeamA] = useState<string[]>(["US", "GB"]);
  const [teamB, setTeamB] = useState<string[]>(["CN", "RU"]);

  const getCombinedMetrics = (codes: string[]) => {
    const teamCountries = codes.map(code => COUNTRIES_DATA.find(c => c.code === code)!);
    return teamCountries.reduce((acc, c) => {
      Object.keys(c.metrics).forEach(key => {
        acc[key as keyof typeof c.metrics] = (acc[key as keyof typeof c.metrics] || 0) + c.metrics[key as keyof typeof c.metrics];
      });
      return acc;
    }, {} as any);
  };

  const metricsA = useMemo(() => getCombinedMetrics(teamA), [teamA]);
  const metricsB = useMemo(() => getCombinedMetrics(teamB), [teamB]);

  const virtualA: Country = { code: "TEAM_A", name: "Coalition Alpha", flagEmoji: "", region: "", metrics: metricsA };
  const virtualB: Country = { code: "TEAM_B", name: "Coalition Bravo", flagEmoji: "", region: "", metrics: metricsB };

  const scores = calculateScores([virtualA, virtualB, ...COUNTRIES_DATA]);
  const scoreA = scores.find(s => s.code === "TEAM_A")!;
  const scoreB = scores.find(s => s.code === "TEAM_B")!;

  const TeamPanel = ({ team, setTeam, label, color }: any) => (
    <Card className={`border-border/50 bg-card/30`}>
      <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className={`text-xs font-mono uppercase tracking-widest ${color}`}>{label}</CardTitle>
        <span className="text-2xl font-black font-mono">
          {team.length > 0 ? (label === "Coalition Alpha" ? scoreA.totalScore : scoreB.totalScore).toFixed(2) : "0.00"}
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
          {team.map((code: string) => {
            const c = COUNTRIES_DATA.find(x => x.code === code)!;
            return (
              <div key={code} className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded text-xs font-mono">
                <FlagIcon code={code} size={16} />
                {c.name}
                <button onClick={() => setTeam(team.filter((t: string) => t !== code))} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRIES_DATA.filter(c => !teamA.includes(c.code) && !teamB.includes(c.code)).map(c => (
            <Button key={c.code} variant="outline" size="sm" className="justify-start text-[10px] h-7" onClick={() => setTeam([...team, c.code])}>
              <Plus className="w-3 h-3 mr-1" /> {c.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Coalition Builder</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Aggregate Force Projection Simulator</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeamPanel team={teamA} setTeam={setTeamA} label="Coalition Alpha" color="text-foreground" />
          <TeamPanel team={teamB} setTeam={setTeamB} label="Coalition Bravo" color="text-primary" />
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <Swords className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-black uppercase italic">Simulation Result</h2>
            <div className="text-5xl font-black font-mono">
              {scoreA.totalScore > scoreB.totalScore ? "ALPHA" : "BRAVO"} DOMINANCE
            </div>
            <p className="text-muted-foreground font-mono text-xs uppercase">
              Aggregate strength differential: {Math.abs(scoreA.totalScore - scoreB.totalScore).toFixed(2)} points
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}