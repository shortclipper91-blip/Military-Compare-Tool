import { useState } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { useListCountries, useCompareCoalitions } from "@workspace/api-client-react";
import type { CategoryWeights } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, X, Plus, Swords, Shield, Plane, Anchor, Truck, DollarSign, Radiation } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from "recharts";

const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};

const ALPHA_COLOR = "hsl(var(--primary))";
const BRAVO_COLOR = "hsl(var(--chart-4))";

function ShareBar({ a, b, labelA, labelB }: { a: number; b: number; labelA: string; labelB: string }) {
  const total = (a + b) || 1;
  const pctA = Math.round((a / total) * 100);
  const pctB = 100 - pctA;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span className="text-primary">{labelA}</span>
        <span style={{ color: BRAVO_COLOR }}>{labelB}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden">
        <div className="bg-primary transition-all rounded-l-full" style={{ width: `${pctA}%` }} />
        <div className="transition-all rounded-r-full" style={{ width: `${pctB}%`, background: BRAVO_COLOR }} />
      </div>
      <div className="flex justify-between text-[10px] font-mono">
        <span className="text-primary font-bold">{pctA}%</span>
        <span className="font-bold" style={{ color: BRAVO_COLOR }}>{pctB}%</span>
      </div>
    </div>
  );
}

function MetricRow({
  label, a, b, format = "compact",
}: {
  label: string;
  a: number | null | undefined;
  b: number | null | undefined;
  format?: "compact" | "currency" | "number";
}) {
  const av = a ?? 0;
  const bv = b ?? 0;
  const fmt = (v: number) =>
    format === "currency" ? formatCurrency(v) : formatCompact(v);
  const total = av + bv || 1;
  const pctA = (av / total) * 100;

  return (
    <div className="grid grid-cols-[1fr_120px_1fr] items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
      <div className="text-right">
        <span className={`text-sm font-mono font-bold ${av >= bv ? "text-primary" : "text-foreground/60"}`}>
          {fmt(av)}
        </span>
      </div>
      <div className="space-y-0.5">
        <div className="text-[10px] font-mono text-muted-foreground text-center uppercase tracking-wider truncate">{label}</div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
          <div className="bg-primary transition-all" style={{ width: `${pctA}%` }} />
          <div className="transition-all" style={{ width: `${100 - pctA}%`, background: BRAVO_COLOR }} />
        </div>
      </div>
      <div className="text-left">
        <span className={`text-sm font-mono font-bold ${bv >= av ? "" : "text-foreground/60"}`} style={bv >= av ? { color: BRAVO_COLOR } : {}}>
          {fmt(bv)}
        </span>
      </div>
    </div>
  );
}

function DomainCard({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/50 bg-card/40">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {children}
      </CardContent>
    </Card>
  );
}

export default function CoalitionBuilder() {
  const [teamA, setTeamA] = useState<string[]>(["US", "GB", "FR"]);
  const [teamB, setTeamB] = useState<string[]>(["CN", "RU"]);

  const { data: countries = [] } = useListCountries();
  const compareMutation = useCompareCoalitions();

  const handleCompare = () => {
    if (teamA.length > 0 && teamB.length > 0) {
      compareMutation.mutate({
        data: { teamA, teamB, weights: DEFAULT_WEIGHTS, scenario: "full" },
      });
    }
  };

  const getCountry = (code: string) => countries.find((c) => c.code === code);

  const TeamList = ({
    team, setTeam, name, colorClass, colorStyle,
  }: {
    team: string[];
    setTeam: (t: string[]) => void;
    name: string;
    colorClass?: string;
    colorStyle?: React.CSSProperties;
  }) => (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm flex flex-col">
      <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
            <div className={`w-2 h-2 rounded-full ${colorClass ?? ""}`} style={colorStyle} />
            {name}
            <span className="text-muted-foreground ml-1">({team.length})</span>
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
                    {countries.filter((c) => !team.includes(c.code)).map((c) => (
                      <CommandItem key={c.code} onSelect={() => setTeam([...team, c.code])}>
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
      <CardContent className="p-4 flex-1 overflow-y-auto max-h-64">
        <div className="space-y-2">
          {team.map((code) => {
            const country = getCountry(code);
            if (!country) return null;
            return (
              <div
                key={code}
                className="flex items-center justify-between bg-background p-2 px-3 rounded-md border border-border group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FlagIcon code={country.code} size={20} />
                  <span className="font-medium text-sm">{country.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => setTeam(team.filter((c) => c !== code))}
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
  const mA = res?.teamA.combinedMetrics;
  const mB = res?.teamB.combinedMetrics;

  const radarData = res
    ? Object.entries(res.teamA.categoryScores).map(([key, scoreA]) => ({
        category: key.replace(/([A-Z])/g, " $1").trim(),
        Alpha: +((scoreA ?? 0) * 100).toFixed(1),
        Bravo: +(((res.teamB.categoryScores as Record<string, number>)[key] ?? 0) * 100).toFixed(1),
      }))
    : [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-10">
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
            {compareMutation.isPending ? "Computing..." : "Execute Simulation"}
            {!compareMutation.isPending && <Swords className="w-4 h-4 ml-2" />}
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TeamList team={teamA} setTeam={setTeamA} name="Coalition Alpha" colorClass="bg-primary" />
          <TeamList team={teamB} setTeam={setTeamB} name="Coalition Bravo" colorStyle={{ background: BRAVO_COLOR }} />
        </div>

        {res && mA && mB && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <h2 className="text-xl font-mono uppercase tracking-widest">Simulation Results</h2>
              <span className={`text-xs font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold ${res.winner === "teamA" ? "bg-primary/20 text-primary" : "text-foreground/60"} `}>
                {res.winner === "teamA" ? "Alpha Wins" : "Bravo Wins"}
              </span>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border-2 ${res.winner === "teamA" ? "border-primary bg-primary/5" : "border-border"}`}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Coalition Alpha</div>
                    <div className={`text-5xl font-bold font-mono ${res.winner === "teamA" ? "text-primary" : ""}`}>
                      {res.teamA.totalScore.toFixed(2)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teamA.map((code) => <FlagIcon key={code} code={code} size={20} />)}
                    </div>
                  </div>
                  {res.winner === "teamA" && (
                    <div className="text-xs font-mono bg-primary text-primary-foreground px-3 py-1 rounded uppercase tracking-widest font-bold">
                      Victory
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className={`border-2 ${res.winner === "teamB" ? "border-border bg-card" : "border-border"}`} style={res.winner === "teamB" ? { borderColor: BRAVO_COLOR } : {}}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Coalition Bravo</div>
                    <div className={`text-5xl font-bold font-mono`} style={res.winner === "teamB" ? { color: BRAVO_COLOR } : {}}>
                      {res.teamB.totalScore.toFixed(2)}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teamB.map((code) => <FlagIcon key={code} code={code} size={20} />)}
                    </div>
                  </div>
                  {res.winner === "teamB" && (
                    <div className="text-xs font-mono text-primary-foreground px-3 py-1 rounded uppercase tracking-widest font-bold" style={{ background: BRAVO_COLOR }}>
                      Victory
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Radar Chart — Category Scores */}
            <Card className="border-border/50 bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Category Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Coalition Alpha" dataKey="Alpha" stroke={ALPHA_COLOR} fill={ALPHA_COLOR} fillOpacity={0.25} />
                      <Radar name="Coalition Bravo" dataKey="Bravo" stroke={BRAVO_COLOR} fill={BRAVO_COLOR} fillOpacity={0.15} />
                      <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: 12 }} />
                      <Tooltip
                        formatter={(v: number) => v.toFixed(1)}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "monospace", fontSize: 12 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Overall metric share bar */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-primary"><div className="w-3 h-3 rounded-sm bg-primary" /> Coalition Alpha</div>
              <div className="flex items-center gap-2" style={{ color: BRAVO_COLOR }}><div className="w-3 h-3 rounded-sm rounded" style={{ background: BRAVO_COLOR }} /> Coalition Bravo</div>
            </div>

            {/* Domain Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* Manpower */}
              <DomainCard icon={<Users className="w-3 h-3" />} title="Manpower">
                <MetricRow label="Active Personnel" a={mA.activePersonnel} b={mB.activePersonnel} />
                <MetricRow label="Reserve Forces" a={mA.reservePersonnel} b={mB.reservePersonnel} />
                <MetricRow label="Paramilitary" a={mA.paramilitary} b={mB.paramilitary} />
                <MetricRow label="Total Population" a={mA.population} b={mB.population} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.activePersonnel ?? 0}
                    b={mB.activePersonnel ?? 0}
                    labelA={`Alpha ${formatCompact(mA.activePersonnel ?? 0)}`}
                    labelB={`Bravo ${formatCompact(mB.activePersonnel ?? 0)}`}
                  />
                </div>
              </DomainCard>

              {/* Air Power */}
              <DomainCard icon={<Plane className="w-3 h-3" />} title="Air Power">
                <MetricRow label="Total Aircraft" a={mA.aircraft} b={mB.aircraft} />
                <MetricRow label="Fighter Jets" a={mA.fighterJets} b={mB.fighterJets} />
                <MetricRow label="Attack Helicopters" a={mA.attackHelicopters} b={mB.attackHelicopters} />
                <MetricRow label="Transport Helicopters" a={mA.transportHelicopters} b={mB.transportHelicopters} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.aircraft ?? 0}
                    b={mB.aircraft ?? 0}
                    labelA={`Alpha ${formatCompact(mA.aircraft ?? 0)}`}
                    labelB={`Bravo ${formatCompact(mB.aircraft ?? 0)}`}
                  />
                </div>
              </DomainCard>

              {/* Ground Forces */}
              <DomainCard icon={<Truck className="w-3 h-3" />} title="Ground Forces">
                <MetricRow label="Tanks" a={mA.tanks} b={mB.tanks} />
                <MetricRow label="Armored Vehicles" a={mA.armoredVehicles} b={mB.armoredVehicles} />
                <MetricRow label="SP Artillery" a={mA.selfPropelledArtillery} b={mB.selfPropelledArtillery} />
                <MetricRow label="Rocket Projectors" a={mA.rocketProjectors} b={mB.rocketProjectors} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.tanks ?? 0}
                    b={mB.tanks ?? 0}
                    labelA={`Alpha ${formatCompact(mA.tanks ?? 0)}`}
                    labelB={`Bravo ${formatCompact(mB.tanks ?? 0)}`}
                  />
                </div>
              </DomainCard>

              {/* Naval Forces */}
              <DomainCard icon={<Anchor className="w-3 h-3" />} title="Naval Forces">
                <MetricRow label="Total Vessels" a={mA.navalVessels} b={mB.navalVessels} />
                <MetricRow label="Submarines" a={mA.submarines} b={mB.submarines} />
                <MetricRow label="Destroyers" a={mA.destroyers} b={mB.destroyers} />
                <MetricRow label="Frigates" a={mA.frigates} b={mB.frigates} />
                <MetricRow label="Aircraft Carriers" a={mA.aircraftCarriers} b={mB.aircraftCarriers} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.navalVessels ?? 0}
                    b={mB.navalVessels ?? 0}
                    labelA={`Alpha ${formatCompact(mA.navalVessels ?? 0)}`}
                    labelB={`Bravo ${formatCompact(mB.navalVessels ?? 0)}`}
                  />
                </div>
              </DomainCard>

              {/* Economy */}
              <DomainCard icon={<DollarSign className="w-3 h-3" />} title="Economy">
                <MetricRow label="Defense Budget" a={mA.defenseBudgetUsd} b={mB.defenseBudgetUsd} format="currency" />
                <MetricRow label="GDP" a={mA.gdpUsd} b={mB.gdpUsd} format="currency" />
                <MetricRow label="Land Area (km²)" a={mA.landAreaKm2} b={mB.landAreaKm2} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.defenseBudgetUsd ?? 0}
                    b={mB.defenseBudgetUsd ?? 0}
                    labelA={`Alpha ${formatCurrency(mA.defenseBudgetUsd ?? 0)}`}
                    labelB={`Bravo ${formatCurrency(mB.defenseBudgetUsd ?? 0)}`}
                  />
                </div>
              </DomainCard>

              {/* Nuclear / Strategic */}
              <DomainCard icon={<Radiation className="w-3 h-3" />} title="Strategic / Nuclear">
                <MetricRow label="Nuclear Warheads" a={mA.nuclearWarheads} b={mB.nuclearWarheads} />
                <div className="mt-3">
                  <ShareBar
                    a={mA.nuclearWarheads ?? 0}
                    b={mB.nuclearWarheads ?? 0}
                    labelA={`Alpha ${(mA.nuclearWarheads ?? 0).toLocaleString()}`}
                    labelB={`Bravo ${(mB.nuclearWarheads ?? 0).toLocaleString()}`}
                  />
                </div>
                <div className="mt-4 p-3 rounded-md bg-secondary/30 border border-border/50 space-y-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Nuclear Parity</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Alpha</div>
                      <div className="text-lg font-bold font-mono text-primary">{(mA.nuclearWarheads ?? 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Bravo</div>
                      <div className="text-lg font-bold font-mono" style={{ color: BRAVO_COLOR }}>{(mB.nuclearWarheads ?? 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </DomainCard>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
