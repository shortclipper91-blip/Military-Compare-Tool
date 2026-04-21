"use client";

import React, { useState, useMemo, useRef } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowRightLeft, Target, Zap, ShieldCheck, Info, Share2 } from "lucide-react";
import { ExportBriefing } from "@/components/ExportBriefing";

export default function Home() {
  const [countryA, setCountryA] = useState("US");
  const [countryB, setCountryB] = useState("CN");
  const exportRef = useRef<HTMLDivElement>(null);

  const scoredData = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  
  const statsA = useMemo(() => scoredData.find(s => s.code === countryA), [scoredData, countryA]);
  const statsB = useMemo(() => scoredData.find(s => s.code === countryB), [scoredData, countryB]);
  
  const dataA = COUNTRIES_DATA.find(c => c.code === countryA);
  const dataB = COUNTRIES_DATA.find(c => c.code === countryB);

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

  const swapCountries = () => {
    setCountryA(countryB);
    setCountryB(countryA);
  };

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
              <ShieldAlert className="w-10 h-10 text-primary" />
              Strategic Assessment
            </h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em] mt-1">
              Head-to-Head Force Comparison Matrix
            </p>
          </div>
          
          {statsA && statsB && (
            <ExportBriefing 
              targetRef={exportRef} 
              filename={`STRATCOM-INTEL-${countryA}-vs-${countryB}.png`} 
            />
          )}
        </header>

        {/* Selection Interface */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center bg-card/50 p-6 border border-border/50 backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-primary/70 ml-1">Primary Force (Alpha)</label>
            <CountrySelector 
              value={countryA} 
              onChange={setCountryA} 
              countries={COUNTRIES_DATA}
              className="h-14 text-lg font-bold"
            />
          </div>

          <button 
            onClick={swapCountries}
            className="mt-6 p-3 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all hover:rotate-180 duration-500"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-primary/70 ml-1">Opposing Force (Bravo)</label>
            <CountrySelector 
              value={countryB} 
              onChange={setCountryB} 
              countries={COUNTRIES_DATA}
              className="h-14 text-lg font-bold"
            />
          </div>
        </div>

        {/* Exportable Area */}
        <div ref={exportRef} className="space-y-8 bg-background">
          {/* Infographic Header (Only visible in export or styled for it) */}
          <div className="hidden group-data-[exporting=true]:block border-b-4 border-primary pb-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="font-black italic text-2xl uppercase tracking-tighter">STRATCOM<span className="text-primary">.INTEL</span></div>
              <div className="bg-primary text-black px-4 py-1 font-mono font-black text-xs uppercase tracking-widest">Top Secret // NOFORN</div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-widest">Intelligence Briefing ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
          </div>

          {/* Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { stats: statsA, data: dataA, label: 'Coalition Alpha', color: 'text-primary' },
              { stats: statsB, data: dataB, label: 'Coalition Bravo', color: 'text-white' }
            ].map((item, idx) => (
              <Card key={idx} className={`border-2 ${idx === 0 ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-card/30'} overflow-hidden relative`}>
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Target className="w-24 h-24" />
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <FlagIcon code={item.data?.code || ""} size={48} className="shadow-xl" />
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{item.label}</div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter italic">{item.data?.name}</h2>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Strength Index</div>
                      <div className={`text-7xl font-black font-mono leading-none ${item.color}`}>
                        {item.stats?.totalScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Global Rank</div>
                      <div className="text-2xl font-bold font-mono">#{(idx === 0 ? 1 : 2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Capability Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-border/50 bg-card/30 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 py-3">
                <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Capability Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'monospace' }} />
                      <Radar
                        name={dataA?.name}
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.5}
                      />
                      <Radar
                        name={dataB?.name}
                        dataKey="B"
                        stroke="#ffffff"
                        fill="#ffffff"
                        fillOpacity={0.2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-3 h-3 bg-primary" /> {dataA?.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase">
                    <div className="w-3 h-3 bg-white/30 border border-white/50" /> {dataB?.name}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 py-3">
                <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Strategic Advantages
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {radarData.map((row, idx) => {
                  const diff = row.A - row.B;
                  const winner = diff > 0 ? dataA : dataB;
                  const percent = Math.abs(diff);
                  
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-background/50 border border-border/50">
                      <div className="w-24 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{row.subject}</div>
                      <div className="flex-1 h-2 bg-muted/20 rounded-none overflow-hidden flex">
                        <div 
                          className={`h-full transition-all duration-1000 ${diff > 0 ? 'bg-primary' : 'bg-white/20'}`} 
                          style={{ width: `${(row.A / (row.A + row.B)) * 100}%` }} 
                        />
                        <div 
                          className={`h-full transition-all duration-1000 ${diff < 0 ? 'bg-white/60' : 'bg-white/5'}`} 
                          style={{ width: `${(row.B / (row.A + row.B)) * 100}%` }} 
                        />
                      </div>
                      <div className="w-32 text-right">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-tighter">
                          {winner?.name} +{percent.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Intelligence Footer (Only visible in export) */}
          <div className="hidden group-data-[exporting=true]:flex justify-between items-end pt-8 border-t border-border/50 opacity-50">
            <div className="space-y-1">
              <div className="text-[8px] font-mono uppercase tracking-widest">Data Integrity: High</div>
              <div className="text-[8px] font-mono uppercase tracking-widest">Source: STRATCOM Unified Intelligence Network</div>
            </div>
            <div className="text-[8px] font-mono uppercase tracking-widest">Generated via STRATCOM.INTEL // {new Date().toISOString()}</div>
          </div>
        </div>

        {/* Tactical Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-none">
          <Info className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[10px] font-mono text-yellow-500/80 leading-relaxed uppercase tracking-wider">
            Assessment based on STRATCOM-6 Unified Dataset. Scores are relative indices and do not account for asymmetric warfare, 
            geographical terrain advantages, or nuclear escalation protocols. For simulation purposes only.
          </p>
        </div>
      </div>
    </Layout>
  );
}