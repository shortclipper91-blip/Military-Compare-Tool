"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA, Country } from "@/lib/countryData";
import { calculateScores } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Swords, Dices, Loader2, Play } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Coalition() {
  const [teamA, setTeamA] = useState<string[]>(["US", "GB"]);
  const [teamB, setTeamB] = useState<string[]>(["CN", "RU"]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);

  // Reset simulation when teams change
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
    
    // Simulate tactical computation time
    setTimeout(() => {
      setIsSimulating(false);
      setHasSimulated(true);
    }, 1800);
  };

  const TeamPanel = ({ team, setTeam, label, color, totalScore }: any) => (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className={`text-xs font-mono uppercase tracking-widest ${color}`}>{label}</CardTitle>
        <span className="text-2xl font-black font-mono">
          {team.length > 0 ? totalScore.toFixed(2) : "0.00"}
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
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TeamPanel 
            team={teamA} 
            setTeam={setTeamA} 
            label="Coalition Alpha" 
            color="text-foreground" 
            totalScore={scoreA?.totalScore || 0}
          />
          <TeamPanel 
            team={teamB} 
            setTeam={setTeamB} 
            label="Coalition Bravo" 
            color="text-primary" 
            totalScore={scoreB?.totalScore || 0}
          />
        </div>

        <div className="relative group">
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
                <div className="p-8 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <Swords className="w-12 h-12 text-primary" />
                  <h2 className="text-2xl font-black uppercase italic">Simulation Result</h2>
                  <div className="text-4xl sm:text-5xl font-black font-mono uppercase">
                    {scoreA.totalScore > scoreB.totalScore ? "Alpha Dominance" : "Bravo Dominance"}
                  </div>
                  <p className="text-muted-foreground font-mono text-xs uppercase tracking-tighter">
                    Aggregate strength differential: {Math.abs(scoreA.totalScore - scoreB.totalScore).toFixed(2)} Index Points
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHasSimulated(false)}
                    className="mt-4 text-[9px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary"
                  >
                    Reset Simulation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}