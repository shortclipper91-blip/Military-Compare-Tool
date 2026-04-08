import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { 
  useListCountries, 
  useCompareCountries,
  useListRegions,
  useListAlliances 
} from "@workspace/api-client-react";
import type { Country, CategoryWeights } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatNumber, formatCurrency, formatCompact } from "@/lib/format";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShieldAlert, ArrowRightLeft, ChevronDown, ChevronUp, Target, Plane, Anchor, Users, DollarSign, Zap } from "lucide-react";

const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};

function CountrySelect({
  value,
  onChange,
  countries,
  label,
}: {
  value: string;
  onChange: (code: string) => void;
  countries: Country[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = countries.find(c => c.code === value);

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-14 justify-start text-base font-medium bg-background/50 border-input hover:bg-background/70 px-4"
          >
            {selected ? (
              <div className="flex items-center gap-3 w-full min-w-0">
                <span className="text-2xl shrink-0 leading-none">{selected.flagEmoji}</span>
                <span className="font-semibold truncate">{selected.name}</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono shrink-0">({selected.code})</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Select Country...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[280px]" align="start">
          <Command>
            <CommandInput placeholder="Search countries..." className="h-9" />
            <CommandList className="max-h-64">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map(c => (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.code}`}
                    onSelect={() => { onChange(c.code); setOpen(false); }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-xl shrink-0">{c.flagEmoji}</span>
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{c.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function StatRow({ label, valueA, valueB, format = "number" }: {
  label: string;
  valueA: number | null | undefined;
  valueB: number | null | undefined;
  format?: "number" | "compact" | "currency";
}) {
  const fmt = (v: number | null | undefined) => {
    if (v == null || v === 0) return "—";
    if (format === "compact") return formatCompact(v);
    if (format === "currency") return formatCompact(v);
    return formatNumber(v);
  };

  const aVal = valueA ?? 0;
  const bVal = valueB ?? 0;
  const aWins = aVal > bVal;
  const bWins = bVal > aVal;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
      <div className={`text-sm font-mono text-right pr-2 ${aWins ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {fmt(valueA)}
      </div>
      <div className="text-xs text-muted-foreground/60 font-mono uppercase tracking-wider text-center w-28 shrink-0">
        {label}
      </div>
      <div className={`text-sm font-mono text-left pl-2 ${bWins ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {fmt(valueB)}
      </div>
    </div>
  );
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-primary/70">{icon}</div>
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function Home() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["US", "CN"]);
  const [weights, setWeights] = useState<CategoryWeights>(DEFAULT_WEIGHTS);
  const [scenario, setScenario] = useState<"full" | "air" | "naval" | "ground">("full");
  const [showDetails, setShowDetails] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);

  const { data: countries = [] } = useListCountries({});

  const compareMutation = useCompareCountries();
  const compareRef = useRef(compareMutation.mutate);
  compareRef.current = compareMutation.mutate;

  useEffect(() => {
    if (selectedCountries.length >= 2 && selectedCountries[0] && selectedCountries[1]) {
      compareRef.current({
        data: {
          countryCodes: selectedCountries,
          weights,
          scenario,
        }
      });
    }
  }, [selectedCountries, weights, scenario]);

  const comparisonResult = compareMutation.data;
  const isComparing = compareMutation.isPending;

  const handleCountryChange = (index: number, code: string) => {
    const newSelection = [...selectedCountries];
    newSelection[index] = code;
    setSelectedCountries(newSelection);
  };

  const countryA = comparisonResult?.countries.find(c => c.code === selectedCountries[0]);
  const countryB = comparisonResult?.countries.find(c => c.code === selectedCountries[1]);

  const radarData = comparisonResult?.categoryBreakdown.map(cat => {
    const dataPoint: Record<string, any> = { category: cat.category };
    selectedCountries.forEach(code => {
      dataPoint[code] = cat.scores[code] || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 pb-10">

        <header className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 font-mono uppercase text-foreground">
                Strategic Assessment
              </h1>
              <p className="text-muted-foreground text-sm">
                Head-to-head comparison of national military capabilities
              </p>
            </div>

            <Popover open={weightsOpen} onOpenChange={setWeightsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed font-mono uppercase text-xs tracking-wider self-start sm:self-auto">
                  Doctrine Weights
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm leading-none uppercase tracking-wider text-primary">Doctrine Assessment Weights</h4>
                  <p className="text-xs text-muted-foreground">Adjust the importance of each category in the overall index score.</p>
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <span className="text-xs text-muted-foreground">{(value * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[value * 100]}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={([val]) => {
                          const newWeights = { ...weights, [key]: val / 100 };
                          const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
                          const normalized = Object.fromEntries(
                            Object.entries(newWeights).map(([k, v]) => [k, v / total])
                          ) as unknown as CategoryWeights;
                          setWeights(normalized);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Tabs value={scenario} onValueChange={(v: any) => setScenario(v)}>
            <TabsList className="flex w-full h-auto flex-wrap gap-1 p-1">
              <TabsTrigger value="full" className="flex-1 min-w-[120px]">Full Spectrum</TabsTrigger>
              <TabsTrigger value="air" className="flex-1 min-w-[120px]">Air Superiority</TabsTrigger>
              <TabsTrigger value="naval" className="flex-1 min-w-[120px]">Naval Dominance</TabsTrigger>
              <TabsTrigger value="ground" className="flex-1 min-w-[120px]">Ground War</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        {/* Country Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
          <CountrySelect
            value={selectedCountries[0]}
            onChange={(v) => handleCountryChange(0, v)}
            countries={countries}
            label="Force A"
          />
          <div className="flex justify-center shrink-0 pb-1">
            <button
              onClick={() => setSelectedCountries([selectedCountries[1], selectedCountries[0]])}
              className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <CountrySelect
            value={selectedCountries[1]}
            onChange={(v) => handleCountryChange(1, v)}
            countries={countries}
            label="Force B"
          />
        </div>

        {/* Results */}
        {comparisonResult && countryA && countryB ? (
          <div className={`flex flex-col gap-6 transition-opacity duration-300 ${isComparing ? "opacity-50" : "opacity-100"}`}>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[countryA, countryB].map((country) => {
                const score = comparisonResult.scores.find(s => s.countryCode === country.code);
                const isWinner = comparisonResult.overallWinner.includes(country.name);
                if (!score) return null;
                return (
                  <Card key={country.code} className={`relative overflow-hidden border-2 ${isWinner ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                    {isWinner && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-mono font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                        Advantage
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl drop-shadow-md leading-none">{country.flagEmoji}</div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">{country.name}</h2>
                            <p className="text-sm font-mono text-muted-foreground tracking-wider uppercase">{country.region}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Index Score</div>
                          <div className={`text-4xl font-bold font-mono ${isWinner ? "text-primary" : "text-foreground"}`}>
                            {score.totalScore.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Active Personnel</div>
                          <div className="font-semibold">{formatCompact(country.metrics.activePersonnel)}</div>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Defense Budget</div>
                          <div className="font-semibold">{formatCompact(country.metrics.defenseBudgetUsd)}</div>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Total Aircraft</div>
                          <div className="font-semibold">{formatNumber(country.metrics.aircraft)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Detailed Intel Toggle */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowDetails(v => !v)}
                className="w-full border-dashed font-mono uppercase text-xs tracking-wider gap-2 h-10"
              >
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showDetails ? "Hide" : "Show"} Detailed Intel — Equipment &amp; Forces Breakdown
              </Button>

              {showDetails && (
                <Card className="mt-3 border-border/50 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-6">
                    {/* Header with country names */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mb-6 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{countryA.flagEmoji}</span>
                        <span className="font-bold text-sm font-mono uppercase tracking-wide">{countryA.name}</span>
                      </div>
                      <div className="w-28 text-center text-xs font-mono text-muted-foreground/40 uppercase">vs</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{countryB.flagEmoji}</span>
                        <span className="font-bold text-sm font-mono uppercase tracking-wide">{countryB.name}</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <DetailSection icon={<Users className="w-4 h-4" />} title="Manpower">
                        <StatRow label="Active Personnel" valueA={countryA.metrics.activePersonnel} valueB={countryB.metrics.activePersonnel} />
                        <StatRow label="Reserve Personnel" valueA={countryA.metrics.reservePersonnel} valueB={countryB.metrics.reservePersonnel} />
                        <StatRow label="Paramilitary" valueA={countryA.metrics.paramilitary} valueB={countryB.metrics.paramilitary} />
                        <StatRow label="Population" valueA={countryA.metrics.population} valueB={countryB.metrics.population} format="compact" />
                      </DetailSection>

                      <DetailSection icon={<Plane className="w-4 h-4" />} title="Air Power">
                        <StatRow label="Total Aircraft" valueA={countryA.metrics.aircraft} valueB={countryB.metrics.aircraft} />
                        <StatRow label="Fighter Jets" valueA={countryA.metrics.fighterJets} valueB={countryB.metrics.fighterJets} />
                        <StatRow label="Attack Helicopters" valueA={countryA.metrics.attackHelicopters} valueB={countryB.metrics.attackHelicopters} />
                        <StatRow label="Transport Helicopters" valueA={countryA.metrics.transportHelicopters} valueB={countryB.metrics.transportHelicopters} />
                      </DetailSection>

                      <DetailSection icon={<Target className="w-4 h-4" />} title="Ground Forces">
                        <StatRow label="Tanks" valueA={countryA.metrics.tanks} valueB={countryB.metrics.tanks} />
                        <StatRow label="Armored Vehicles" valueA={countryA.metrics.armoredVehicles} valueB={countryB.metrics.armoredVehicles} />
                        <StatRow label="SP Artillery" valueA={countryA.metrics.selfPropelledArtillery} valueB={countryB.metrics.selfPropelledArtillery} />
                        <StatRow label="Rocket Projectors" valueA={countryA.metrics.rocketProjectors} valueB={countryB.metrics.rocketProjectors} />
                      </DetailSection>

                      <DetailSection icon={<Anchor className="w-4 h-4" />} title="Naval Forces">
                        <StatRow label="Total Vessels" valueA={countryA.metrics.navalVessels} valueB={countryB.metrics.navalVessels} />
                        <StatRow label="Submarines" valueA={countryA.metrics.submarines} valueB={countryB.metrics.submarines} />
                        <StatRow label="Destroyers" valueA={countryA.metrics.destroyers} valueB={countryB.metrics.destroyers} />
                        <StatRow label="Frigates" valueA={countryA.metrics.frigates} valueB={countryB.metrics.frigates} />
                        <StatRow label="Aircraft Carriers" valueA={countryA.metrics.aircraftCarriers} valueB={countryB.metrics.aircraftCarriers} />
                      </DetailSection>

                      <DetailSection icon={<DollarSign className="w-4 h-4" />} title="Economy">
                        <StatRow label="Defense Budget" valueA={countryA.metrics.defenseBudgetUsd} valueB={countryB.metrics.defenseBudgetUsd} format="compact" />
                        <StatRow label="GDP" valueA={countryA.metrics.gdpUsd} valueB={countryB.metrics.gdpUsd} format="compact" />
                        <StatRow label="Land Area (km²)" valueA={countryA.metrics.landAreaKm2} valueB={countryB.metrics.landAreaKm2} format="compact" />
                      </DetailSection>

                      <DetailSection icon={<Zap className="w-4 h-4" />} title="Strategic">
                        <StatRow label="Nuclear Warheads" valueA={countryA.metrics.nuclearWarheads} valueB={countryB.metrics.nuclearWarheads} />
                      </DetailSection>
                    </div>

                    {/* Data sources */}
                    <div className="mt-8 pt-4 border-t border-border/30">
                      <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest mb-2">Data Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set([...countryA.dataSources, ...countryB.dataSources].map(s => s.source))].map(src => (
                          <Badge key={src} variant="secondary" className="text-xs font-mono">{src}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Radar Chart + Advantages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Capability Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" }} />
                        <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={false} axisLine={false} />
                        <Radar name={countryA.name} dataKey={selectedCountries[0]} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                        <Radar name={countryB.name} dataKey={selectedCountries[1]} stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 h-3 rounded-full bg-primary/60 border border-primary" />
                      {countryA.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 h-3 rounded-full" style={{ background: "hsl(var(--chart-4) / 0.6)", borderColor: "hsl(var(--chart-4))", border: "1px solid" }} />
                      {countryB.name}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Strategic Advantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comparisonResult.categoryBreakdown.map((cat, idx) => {
                      const winner = comparisonResult.countries.find(c => c.code === cat.advantageCountryCode);
                      const aScore = cat.scores[selectedCountries[0]] ?? 0;
                      const bScore = cat.scores[selectedCountries[1]] ?? 0;
                      const total = aScore + bScore || 1;
                      const aPercent = Math.round((aScore / total) * 100);
                      const bPercent = 100 - aPercent;
                      if (!winner) return null;
                      return (
                        <div key={idx} className="p-3 rounded-lg border border-border/50 bg-secondary/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{cat.category}</span>
                            <span className="font-bold text-sm flex items-center gap-2">
                              {winner.flagEmoji} {winner.name}
                              <span className="text-xs text-muted-foreground font-normal">advantage</span>
                            </span>
                          </div>
                          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary rounded-full transition-all" style={{ width: `${aPercent}%` }} />
                            <div className="rounded-full transition-all" style={{ width: `${bPercent}%`, background: "hsl(var(--chart-4))" }} />
                          </div>
                          <div className="flex justify-between text-xs font-mono text-muted-foreground">
                            <span>{countryA.flagEmoji} {aPercent}%</span>
                            <span>{bPercent}% {countryB.flagEmoji}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        ) : (
          <div className="flex-1 min-h-64 flex items-center justify-center border border-dashed border-border rounded-xl bg-card/20">
            <div className="text-center">
              <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-mono uppercase tracking-widest text-muted-foreground">Awaiting Assessment Parameters</h3>
              <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm mx-auto">Select two forces to initiate strategic comparison matrix.</p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
