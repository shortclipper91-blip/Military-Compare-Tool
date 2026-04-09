import { useState } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries, useCompareCoalitions } from "@workspace/api-client-react";
import type { CategoryWeights, Country } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatCompact } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, X, Plus, Swords } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};

export default function CoalitionBuilder() {
  const [teamA, setTeamA] = useState<string[]>(["USA", "GBR", "FRA"]);
  const [teamB, setTeamB] = useState<string[]>(["CHN", "RUS"]);

  const { data: countries = [] } = useListCountries();
  const compareMutation = useCompareCoalitions();

  const handleCompare = () => {
    if (teamA.length > 0 && teamB.length > 0) {
      compareMutation.mutate({
        data: {
          teamA,
          teamB,
          weights: DEFAULT_WEIGHTS,
          scenario: "full"
        }
      });
    }
  };

  const getCountry = (code: string) => countries.find(c => c.code === code);

  const TeamList = ({ team, setTeam, name, colorClass }: { team: string[], setTeam: (t: string[]) => void, name: string, colorClass: string }) => (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
            <div className={`w-2 h-2 rounded-full ${colorClass}`} />
            {name}
            <span className="text-muted-foreground ml-2">({team.length})</span>
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed font-mono text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <Command>
                <CommandInput placeholder="Search nation..." />
                <CommandList>
                  <CommandEmpty>No nation found.</CommandEmpty>
                  <CommandGroup>
                    {countries.filter(c => !team.includes(c.code)).map(c => (
                      <CommandItem
                        key={c.code}
                        onSelect={() => setTeam([...team, c.code])}
                      >
                        <FlagIcon code={c.code} size={20} className="mr-2" />
                        {c.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {team.map(code => {
            const country = getCountry(code);
            if (!country) return null;
            return (
              <div key={code} className="flex items-center justify-between bg-background p-2 px-3 rounded-md border border-border group hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <FlagIcon code={country.code} size={20} />
                  <span className="font-medium text-sm">{country.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => setTeam(team.filter(c => c !== code))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
          {team.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground font-mono uppercase tracking-widest">
              Empty Roster
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const res = compareMutation.data;

  // Prepare chart data
  const chartData = res ? [
    {
      metric: 'Personnel',
      TeamA: res.teamA.combinedMetrics.activePersonnel,
      TeamB: res.teamB.combinedMetrics.activePersonnel,
    },
    {
      metric: 'Budget (USD)',
      TeamA: res.teamA.combinedMetrics.defenseBudgetUsd,
      TeamB: res.teamB.combinedMetrics.defenseBudgetUsd,
    },
    {
      metric: 'Aircraft',
      TeamA: res.teamA.combinedMetrics.aircraft,
      TeamB: res.teamB.combinedMetrics.aircraft,
    },
    {
      metric: 'Naval Vessels',
      TeamA: res.teamA.combinedMetrics.navalVessels,
      TeamB: res.teamB.combinedMetrics.navalVessels,
    }
  ] : [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 font-mono uppercase text-foreground">
              Coalition Simulator
            </h1>
            <p className="text-muted-foreground text-sm">
              Combine forces to evaluate aggregate strategic capabilities
            </p>
          </div>
          <Button 
            onClick={handleCompare} 
            disabled={teamA.length === 0 || teamB.length === 0 || compareMutation.isPending}
            className="font-mono uppercase tracking-widest font-bold"
          >
            {compareMutation.isPending ? 'Computing...' : 'Execute Simulation'}
            {!compareMutation.isPending && <Swords className="w-4 h-4 ml-2" />}
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
          <TeamList team={teamA} setTeam={setTeamA} name="Coalition Alpha" colorClass="bg-primary" />
          <TeamList team={teamB} setTeam={setTeamB} name="Coalition Bravo" colorClass="bg-chart-4" />
        </div>

        {res && (
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-mono uppercase tracking-widest border-b border-border pb-2">Simulation Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className={`border-2 ${res.winner === 'teamA' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <CardContent className="p-6">
                  <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">Coalition Alpha Score</div>
                  <div className={`text-5xl font-bold font-mono ${res.winner === 'teamA' ? 'text-primary' : ''}`}>
                    {res.teamA.totalScore.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-2 ${res.winner === 'teamB' ? 'border-chart-4 bg-chart-4/5' : 'border-border'}`}>
                <CardContent className="p-6">
                  <div className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">Coalition Bravo Score</div>
                  <div className={`text-5xl font-bold font-mono ${res.winner === 'teamB' ? 'text-chart-4' : ''}`}>
                    {res.teamB.totalScore.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Aggregate Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tickFormatter={(val) => formatCompact(val)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontFamily: "monospace" }} />
                      <YAxis dataKey="metric" type="category" tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontFamily: "monospace" }} width={120} />
                      <Tooltip 
                        formatter={(val: number) => formatCompact(val)}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "monospace" }}
                      />
                      <Legend wrapperStyle={{ fontFamily: "monospace" }} />
                      <Bar dataKey="TeamA" name="Coalition Alpha" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="TeamB" name="Coalition Bravo" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

      </div>
    </Layout>
  );
}
