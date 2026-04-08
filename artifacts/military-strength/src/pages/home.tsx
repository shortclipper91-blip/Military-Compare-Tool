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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ShieldAlert, ArrowRightLeft, Flag } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DEFAULT_WEIGHTS: CategoryWeights = {
  manpower: 0.2,
  airPower: 0.2,
  groundForces: 0.2,
  navalForces: 0.2,
  economy: 0.1,
  logistics: 0.1,
};

export default function Home() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["USA", "CHN"]);
  const [weights, setWeights] = useState<CategoryWeights>(DEFAULT_WEIGHTS);
  const [scenario, setScenario] = useState<"full" | "air" | "naval" | "ground">("full");
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [allianceFilter, setAllianceFilter] = useState<string>("");

  const { data: countries = [], isLoading: isLoadingCountries } = useListCountries({
    region: regionFilter || undefined,
    alliance: allianceFilter || undefined,
  });

  const { data: metadata } = useListRegions();
  const { data: alliances } = useListAlliances();

  const compareMutation = useCompareCountries();
  
  // Custom hook to avoid dependency infinite loop
  const compareRef = useRef(compareMutation.mutate);
  compareRef.current = compareMutation.mutate;

  useEffect(() => {
    if (selectedCountries.length >= 2) {
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

  const radarData = comparisonResult?.categoryBreakdown.map(cat => {
    const dataPoint: any = { category: cat.category };
    selectedCountries.forEach(code => {
      dataPoint[code] = cat.scores[code] || 0;
    });
    return dataPoint;
  }) || [];

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 font-mono uppercase text-foreground">
              Strategic Assessment
            </h1>
            <p className="text-muted-foreground text-sm">
              Head-to-head comparison of national military capabilities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={scenario} onValueChange={(v: any) => setScenario(v)} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="full">Full Spectrum</TabsTrigger>
                <TabsTrigger value="air">Air Superiority</TabsTrigger>
                <TabsTrigger value="naval">Naval Dominance</TabsTrigger>
                <TabsTrigger value="ground">Ground War</TabsTrigger>
              </TabsList>
            </Tabs>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-dashed font-mono uppercase text-xs tracking-wider">
                  Doctrine Weights
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm leading-none uppercase tracking-wider text-primary">Doctrine Assessment Weights</h4>
                  <p className="text-xs text-muted-foreground">Adjust the importance of different military branches in the overall score computation.</p>
                  
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
                          
                          // Normalize to 1
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
        </header>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">Force A</label>
            <Select value={selectedCountries[0]} onValueChange={(v) => handleCountryChange(0, v)}>
              <SelectTrigger className="h-14 text-lg font-medium bg-background/50">
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center">
                      <span className="mr-3 text-2xl">{c.flagEmoji}</span>
                      {c.name} <span className="ml-2 text-xs text-muted-foreground font-mono">({c.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center shrink-0 mt-6">
            <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground px-1">Force B</label>
            <Select value={selectedCountries[1]} onValueChange={(v) => handleCountryChange(1, v)}>
              <SelectTrigger className="h-14 text-lg font-medium bg-background/50">
                <SelectValue placeholder="Select Country..." />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center">
                      <span className="mr-3 text-2xl">{c.flagEmoji}</span>
                      {c.name} <span className="ml-2 text-xs text-muted-foreground font-mono">({c.code})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Area */}
        {comparisonResult ? (
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isComparing ? 'opacity-50' : 'opacity-100'}`}>
            
            {/* Score Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCountries.map((code, i) => {
                const country = comparisonResult.countries.find(c => c.code === code);
                const score = comparisonResult.scores.find(s => s.countryCode === code);
                const isWinner = comparisonResult.overallWinner === code;
                
                if (!country || !score) return null;

                return (
                  <Card key={code} className={`relative overflow-hidden border-2 ${isWinner ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                    {isWinner && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-mono font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">
                        Advantage
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl drop-shadow-md">{country.flagEmoji}</div>
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight">{country.name}</h2>
                            <p className="text-sm font-mono text-muted-foreground tracking-wider uppercase">{country.region}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Index Score</div>
                          <div className={`text-4xl font-bold font-mono ${isWinner ? 'text-primary' : 'text-foreground'}`}>
                            {score.totalScore.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 grid grid-cols-3 gap-4">
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Personnel</div>
                          <div className="font-medium">{formatCompact(country.metrics.activePersonnel)}</div>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Budget</div>
                          <div className="font-medium">{formatCompact(country.metrics.defenseBudgetUsd)}</div>
                        </div>
                        <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                          <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Aircraft</div>
                          <div className="font-medium">{formatNumber(country.metrics.aircraft)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Radar Chart */}
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
                      <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                      <Radar name={selectedCountries[0]} dataKey={selectedCountries[0]} stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                      <Radar name={selectedCountries[1]} dataKey={selectedCountries[1]} stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} />
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace", paddingTop: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "monospace" }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Advantages */}
            <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Strategic Advantages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisonResult.categoryBreakdown.map((cat, idx) => {
                    const country = comparisonResult.countries.find(c => c.code === cat.advantageCountryCode);
                    if (!country) return null;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30">
                        <span className="font-mono text-sm uppercase tracking-wider text-muted-foreground">{cat.category}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Advantage</span>
                            <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                              {country.name}
                              <span className="text-lg">{country.flagEmoji}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl bg-card/20">
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
