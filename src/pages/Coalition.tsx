"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA, Country } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Swords, 
  Dices, 
  Loader2, 
  Play, 
  Trophy, 
  Users, 
  Plane, 
  Target, 
  Anchor, 
  DollarSign, 
  Zap, 
  Radiation, 
  Shield,
  Download,
  ShieldCheck
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { exportAsImage } from "@/lib/export";

const AggregateStat = ({ icon: Icon, label, valA, valB, format = "compact" }: any) => {
  const isAWinner = (valA || 0) > (valB || 0);
  const isBWinner = (valB || 0) > (valA || 0);
  const fmt = (v: number) => {
    if (format === "currency") return formatCurrency(v);
    if (format === "number") return formatNumber(v);
    return formatCompact(v);
  };

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-border/20 last:border-0 group hover:bg-primary/5 transition-colors px-2 -mx-2">
      <div className={cn("text-right font-mono text-sm", isAWinner ? "text-primary font-bold" : "text-muted-foreground")}>
        {fmt(valA || 0)}
      </div>
      <div className="flex flex-col items-center gap-1 w-32">
        <Icon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/40 transition-colors" />
        <span className="text-[9px] font-mono uppercase text-muted-foreground/60 tracking-tighter text-center group-hover:text-muted-foreground transition-colors">{label}</span>
      </div>
      <div className={cn("text-left font-mono text-sm", isBWinner ? "text-primary font-bold" : "text-muted-foreground")}>
        {fmt(valB || 0)}
      </div>
    </div>
  );
};

export default function Coalition() {
  const [teamA, setTeamA] = useState<string[]>(["US", "GB"]);
  const [teamB, setTeamB] = useState<string[]>(["CN", "RU"]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setHasSimulated(false);
  }, [teamA, teamB]);

  const getCombinedMetrics = (codes: string[]) => {
    const teamCountries = codes.map(code => COUNTRIES_DATA.find(c => c.code === code)).filter(Boolean) as Country[];
    const combined: any = {};
    
    teamCountries.forEach(c => {
      Object.entries(c.metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          combined[key] = (combined[key] || 0) + value;
        }
      });
    });
    
    return combined;
  };

  const metricsA = useMemo(() => getCombinedMetrics(teamA), [teamA]);
  const metricsB = useMemo(() => getCombinedMetrics(teamB), [teamB]);

  const virtualA: Country = { 
    code: "TEAM_A", 
    name: "Coalition Alpha", 
    flagEmoji: "🅰️", 
    region: "COMBINED", 
    continent: "COMBINED",
    alliances: [],
    metrics: metricsA 
  };
  
  const virtualB: Country = { 
    code: "TEAM_B", 
    name: "Coalition Bravo", 
    flagEmoji: "🅱️", 
    region: "COMBINED", 
    continent: "COMBINED",
    alliances: [],
    metrics: metricsB 
  };

  const scores = useMemo(() => calculateScores([virtualA, virtualB, ...COUNTRIES_DATA]), [virtualA, virtualB]);
  const scoreA = scores.find(s => s.code === "TEAM_A")!;
  const scoreB = scores.find(s => s.code === "TEAM_B")!;

  const isWinnerA = hasSimulated && scoreA.totalScore > scoreB.totalScore;
  const isWinnerB = hasSimulated && scoreB.totalScore > scoreA.totalScore;

  const handleRandomize = () => {
    const available = [...COUNTRIES_DATA];
    const newTeamA: string[] = [];
    const newTeamB: string[] = [];
    
    const countA = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < countA; i++) {
      if (available.length === 0) break;
      const idx = Math.floor(Math.random() * available.length);
      newTeamA.push(available.splice(idx, 1)[0].code);
    }
    
    const countB = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < countB; i++) {
      if (available.length === 0) break;
      const idx = Math.floor(Math.random() * available.length);
      newTeamB.push(available.splice(idx, 1)[0].code);
    }
    
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  const executeSimulation = () => {
    if (teamA.length === 0 || teamB.length === 0) return;
    setIsSimulating(true);
    setHasSimulated(false);
    
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 1800);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportAsImage("coalition-capture", `STRATCOM-Coalition-Simulation.png`);
    setIsExporting(false);
  };

  const TeamPanel = ({ team, setTeam, label, color, totalScore, hasSimulated, isWinner }: any) => (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className={`text-xs font-mono uppercase tracking-widest ${color}`}>{label}</CardTitle>
        <span className={cn(
          "text-2xl font-black font-mono transition-all duration-700",
          !hasSimulated && "opacity-30 blur-[2px]",
          isWinner && "text-primary"
        )}>
          {hasSimulated ? totalScore.toFixed(2) : "??.??"}
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2 min-h-[120px] content-start">
          {team.map((code: string) => {
            const c = COUNTRIES_DATA.find(x => x.code === code);
            if (!c) return null;
            return (
              <div key={code} className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded text-xs font-mono group hover:border-primary/30 transition-colors">
                <FlagIcon code={code} size={16} />
                <span className="truncate max-w-[100px]">{c.name}</span>
                <button 
                  onClick={() => setTeam(team.filter((t: string) => t !== code))} 
                  className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          {team.length === 0 && (
            <div className="w-full h-24 flex items-center justify-center border border-dashed border-border rounded text-muted-foreground text-xs uppercase tracking-widest">
              No nations assigned
            </div>
          )}
        </div>
        
        <div className="pt-2">
          <CountrySelector 
            value="" 
            onChange={(val) => !team.includes(val) && setTeam([...team, val])}
            placeholder="Add nation..."
            exclude={[...teamA, ...teamB]}
            countries={COUNTRIES_DATA}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Coalition Builder</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Aggregate Force Projection Simulator</p>
          </div>
          <div className="flex gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRandomize}
                    className="h-12 w-12 border-border/50 hover:border-primary/50 hover:text-primary bg-primary/5"
                  >
                    <Dices className="w-6 h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Randomize Coalitions</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {hasSimulated && (
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="font-mono text-[10px] uppercase tracking-widest h-12 px-6 rounded-none border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary"
              >
                {isExporting ? "Generating..." : "Export Briefing"}
                <Download className="ml-2 w-3 h-3" />
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeamPanel 
            team={teamA} 
            setTeam={setTeamA} 
            label="Coalition Alpha" 
            color="text-foreground" 
            totalScore={scoreA?.totalScore || 0}
            hasSimulated={hasSimulated}
            isWinner={isWinnerA}
          />
          <TeamPanel 
            team={teamB} 
            setTeam={setTeamB} 
            label="Coalition Bravo" 
            color="text-primary" 
            totalScore={scoreB?.totalScore || 0}
            hasSimulated={hasSimulated}
            isWinner={isWinnerB}
          />
        </div>

        <div id="coalition-capture" className="relative group bg-background">
          {/* Branding for export */}
          <div className="hidden show-on-export flex items-center justify-between border-b border-primary/20 pb-4 mb-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-xl font-black tracking-tighter uppercase italic leading-none">STRATCOM<span className="text-primary">.INTEL</span></h2>
                <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.3em] mt-1">Coalition Simulation Briefing // {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-primary uppercase font-bold">Security Clearance: Level 4</div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase mt-1">Subject: Aggregate Force Projection</div>
            </div>
          </div>

          <Card className={`border-2 transition-all duration-500 overflow-hidden ${hasSimulated ? 'border-primary/40 bg-primary/5' : 'border-border/50 bg-card/30'}`}>
            <CardContent className="p-0">
              {!hasSimulated && !isSimulating ? (
                <button 
                  onClick={executeSimulation}
                  disabled={teamA.length === 0 || teamB.length === 0}
                  className="w-full p-12 flex flex-col items-center justify-center space-y-4 hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:border-primary transition-transform">
                    <Play className="w-6 h-6 text-primary fill-primary/20 ml-1" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black uppercase italic tracking-wider">Execute Simulation</h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Awaiting Command Authorization</p>
                  </div>
                </button>
              ) : isSimulating ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-6 animate-pulse">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-black uppercase italic tracking-wider">Processing Matrix</h2>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-[0.4em]">Analyzing Combined Capabilities...</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex flex-col items-center gap-4">
                    <Trophy className="w-12 h-12 text-primary animate-bounce" />
                    <h2 className="text-2xl font-black uppercase italic">Simulation Result</h2>
                    <div className="text-4xl sm:text-5xl font-black font-mono uppercase text-primary">
                      {scoreA.totalScore > scoreB.totalScore ? "Alpha Dominance" : "Bravo Dominance"}
                    </div>
                  </div>

                  <div className="w-full max-w-2xl bg-background/40 border border-border/50 p-6 rounded-none space-y-1">
                    <div className="flex justify-between px-2 mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <span>Coalition Alpha</span>
                      <span>Tactical Metrics</span>
                      <span>Coalition Bravo</span>
                    </div>
                    <AggregateStat icon={Users} label="Total Personnel" valA={metricsA.activePersonnel} valB={metricsB.activePersonnel} />
                    <AggregateStat icon={Plane} label="Total Aircraft" valA={metricsA.aircraft} valB={metricsB.aircraft} />
                    <AggregateStat icon={Zap} label="Fighter Jets" valA={metricsA.fighterJets} valB={metricsB.fighterJets} />
                    <AggregateStat icon={Target} label="Main Battle Tanks" valA={metricsA.tanks} valB={metricsB.tanks} />
                    <AggregateStat icon={Anchor} label="Naval Assets" valA={metricsA.navalVessels} valB={metricsB.navalVessels} />
                    <AggregateStat icon={Shield} label="Submarines" valA={metricsA.submarines} valB={metricsB.submarines} />
                    <AggregateStat icon={Radiation} label="Nuclear Warheads" valA={metricsA.nuclearWarheads} valB={metricsB.nuclearWarheads} format="number" />
                    <AggregateStat icon={DollarSign} label="Defense Budget" valA={metricsA.defenseBudgetUsd} valB={metricsB.defenseBudgetUsd} format="currency" />
                  </div>

                  <p className="text-muted-foreground font-mono text-xs uppercase tracking-tighter">
                    Aggregate strength differential: {Math.abs(scoreA.totalScore - scoreB.totalScore).toFixed(2)} Index Points
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHasSimulated(false)}
                    className="mt-2 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary no-export"
                  >
                    Reset Simulation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer for export */}
          <div className="hidden show-on-export pt-8 border-t border-border/30 flex justify-between items-end opacity-50">
            <div className="text-[8px] font-mono uppercase tracking-widest">
              Generated via STRATCOM.INTEL // Aggregate Force Projection Simulator v4.2.0
            </div>
            <div className="text-[8px] font-mono uppercase tracking-tighter">
              Data Sources: IISS, SIPRI, GFP, FAS (2023-2024)
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}