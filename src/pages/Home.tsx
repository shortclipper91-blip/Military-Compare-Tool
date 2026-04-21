"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from "recharts";
import { 
  Swords, ShieldAlert, Zap, Target, TrendingUp, 
  Globe, Flame, Share2, Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ExportButton";

const FLASHPOINTS = [
  { name: "Pacific Tension", a: "US", b: "CN", icon: Globe },
  { name: "Eastern Front", a: "RU", b: "UA", icon: Flame },
  { name: "Middle East Rivalry", a: "SA", b: "IR", icon: Target },
  { name: "Korean Peninsula", a: "KR", b: "KP", icon: ShieldAlert },
];

export default function Home() {
  const [countryA, setCountryA] = useState("US");
  const [countryB, setCountryB] = useState("CN");

  const scoredData = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  
  const statsA = useMemo(() => scoredData.find(s => s.code === countryA), [scoredData, countryA]);
  const statsB = useMemo(() => scoredData.find(s => s.code === countryB), [scoredData, countryB]);
  const dataA = useMemo(() => COUNTRIES_DATA.find(c => c.code === countryA), [countryA]);
  const dataB = useMemo(() => COUNTRIES_DATA.find(c => c.code === countryB), [countryB]);

  const radarData = useMemo(() => {
    if (!statsA || !statsB) return [];
    return [
      { subject: 'Manpower', A: statsA.categories.manpower, B: statsB.categories.manpower },
      { subject: 'Air Power', A: statsA.categories.airPower, B: statsB.categories.airPower },
      { subject: 'Ground', A: statsA.categories.groundForces, B: statsB.categories.groundForces },
      { subject: 'Naval', A: statsA.categories.navalForces, B: statsB.categories.navalForces },
      { subject: 'Economy', A: statsA.categories.economy, B: statsB.categories.economy },
      { subject: 'Logistics', A: statsA.categories.logistics, B: statsB.categories.logistics },
    ];
  }, [statsA, statsB]);

  const loadFlashpoint = (a: string, b: string) => {
    setCountryA(a);
    setCountryB(b);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        {/* Header & Flashpoints */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <Swords className="w-10 h-10 text-primary" />
              Strategic Assessment
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em]">
              Head-to-Head Combat Capability Matrix
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="w-full lg:w-auto text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 lg:mb-0 lg:mr-2 self-center">
              Flashpoint Presets:
            </div>
            {FLASHPOINTS.map((fp) => (
              <Button
                key={fp.name}
                variant="outline"
                size="sm"
                onClick={() => loadFlashpoint(fp.a, fp.b)}
                className="h-8 text-[10px] font-mono uppercase tracking-wider border-primary/20 hover:border-primary/50 hover:bg-primary/5"
              >
                <fp.icon className="w-3 h-3 mr-2 text-primary" />
                {fp.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card/50 p-4 border border-border/50 backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Primary Force (Alpha)</label>
            <CountrySelector value={countryA} onChange={setCountryA} countries={COUNTRIES_DATA} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Opposing Force (Bravo)</label>
            <CountrySelector value={countryB} onChange={setCountryB} countries={COUNTRIES_DATA} />
          </div>
        </div>

        {/* Analysis Results Area (Target for Export) */}
        <div id="briefing-area" className="space-y-6 relative">
          {/* Export Overlay (Hidden in normal view, visible in export) */}
          <div className="hidden exporting-only border-b-2 border-primary pb-4 mb-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">STRATCOM.INTEL BRIEFING</h2>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Classified Assessment Report</p>
              </div>
              <div className="text-right font-mono text-[10px] text-muted-foreground">
                DATE: {new Date().toLocaleDateString()} <br />
                REF: ASSESSMENT-{countryA}-{countryB}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] font-bold">Intelligence Summary</h2>
            </div>
            <ExportButton targetId="briefing-area" filename={`stratcom-${countryA}-vs-${countryB}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Force Alpha */}
            <Card className="border-primary/30 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Zap className="w-24 h-24 text-primary" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <FlagIcon code={countryA} size={48} className="shadow-xl border border-white/10" />
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{dataA?.name}</h3>
                      <span className="text-[10px] font-mono text-primary uppercase tracking-widest">Force Alpha</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Strength Index</div>
                    <div className="text-5xl font-black font-mono text-primary leading-none tabular-nums">
                      {statsA?.totalScore.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Personnel</div>
                    <div className="text-xs font-bold font-mono">{(dataA?.activePersonnel! / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Budget</div>
                    <div className="text-xs font-bold font-mono">${(dataA?.defenseBudgetUsd! / 1e9).toFixed(0)}B</div>
                  </div>
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Aircraft</div>
                    <div className="text-xs font-bold font-mono">{dataA?.aircraft}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Force Bravo */}
            <Card className="border-border/50 bg-card/30 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <FlagIcon code={countryB} size={48} className="shadow-xl border border-white/10" />
                    <div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{dataB?.name}</h3>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Force Bravo</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Strength Index</div>
                    <div className="text-5xl font-black font-mono text-foreground leading-none tabular-nums">
                      {statsB?.totalScore.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Personnel</div>
                    <div className="text-xs font-bold font-mono">{(dataB?.activePersonnel! / 1000).toFixed(0)}K</div>
                  </div>
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Budget</div>
                    <div className="text-xs font-bold font-mono">${(dataB?.defenseBudgetUsd! / 1e9).toFixed(0)}B</div>
                  </div>
                  <div className="bg-background/40 p-2 border border-border/50">
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">Aircraft</div>
                    <div className="text-xs font-bold font-mono">{dataB?.aircraft}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capability Matrix */}
            <Card className="border-border/50 bg-card/30 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Capability Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Alpha" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                      <Radar name="Bravo" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Advantage Breakdown */}
            <Card className="border-border/50 bg-card/30 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Strategic Advantages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {radarData.map((item) => {
                  const diff = item.A - item.B;
                  const winner = diff > 0 ? 'Alpha' : 'Bravo';
                  const absDiff = Math.abs(diff);
                  return (
                    <div key={item.subject} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono uppercase">{item.subject}</span>
                        <span className={cn("text-[10px] font-mono font-bold", diff > 0 ? "text-primary" : "text-muted-foreground")}>
                          {winner} +{absDiff.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/30 flex">
                        <div 
                          className={cn("h-full transition-all", diff > 0 ? "bg-primary" : "bg-muted-foreground/40")} 
                          style={{ width: `${(Math.max(item.A, item.B) / 100) * 100}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Footer Watermark for Export */}
          <div className="hidden exporting-only pt-8 border-t border-border/30 flex justify-between items-center opacity-50">
            <div className="text-[8px] font-mono uppercase tracking-widest">STRATCOM.INTEL // UNIFIED COMMAND DATASET</div>
            <div className="text-[8px] font-mono uppercase tracking-widest">CONFIDENTIAL // FOR STRATEGIC USE ONLY</div>
          </div>
        </div>
      </div>

      <style>{`
        .exporting-briefing .exporting-only {
          display: flex !important;
        }
        .exporting-briefing {
          padding: 40px !important;
          background-color: #0f172a !important;
        }
      `}</style>
    </Layout>
  );
}