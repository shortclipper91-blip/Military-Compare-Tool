import { useState } from "react";
import { Layout } from "@/components/layout";
import { useListCountries, useGetCountryTimeline } from "@workspace/api-client-react";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Activity } from "lucide-react";

export default function Timeline() {
  const [selectedCountry, setSelectedCountry] = useState<string>("USA");
  const { data: countries = [] } = useListCountries();
  
  const { data: timeline = [], isLoading } = useGetCountryTimeline(selectedCountry, {
    query: { enabled: !!selectedCountry }
  });

  const country = countries.find(c => c.code === selectedCountry);

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 font-mono uppercase text-foreground">
              Historical Trajectory
            </h1>
            <p className="text-muted-foreground text-sm">
              Longitudinal analysis of military spending and capability scaling
            </p>
          </div>

          <div className="w-72">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="font-medium bg-background/50 h-10">
                <SelectValue placeholder="Select Nation" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center">
                      <span className="mr-2">{c.flagEmoji}</span>
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl bg-card/20 h-96">
            <div className="flex flex-col items-center text-muted-foreground animate-pulse">
              <Activity className="w-8 h-8 mb-4" />
              <span className="font-mono uppercase tracking-widest text-sm">Retrieving Historical Data...</span>
            </div>
          </div>
        ) : timeline.length > 0 ? (
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Defense Expenditure (USD)</span>
                  <span className="text-foreground text-base">
                    {country?.flagEmoji} {country?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} 
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis 
                        tickFormatter={(val) => formatCompact(val)} 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(val: number) => [formatCurrency(val), "Budget"]}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "monospace", borderRadius: "8px" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="defenseBudgetUsd" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorBudget)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Active Personnel scaling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeline} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} 
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis 
                        tickFormatter={(val) => formatCompact(val)} 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                        axisLine={false}
                        tickLine={false}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(val: number) => [formatCompact(val), "Personnel"]}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontFamily: "monospace", borderRadius: "8px" }}
                      />
                      <Line 
                        type="step" 
                        dataKey="activePersonnel" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl bg-card/20 h-96">
            <span className="font-mono text-muted-foreground uppercase tracking-widest">No historical data available for this nation</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
