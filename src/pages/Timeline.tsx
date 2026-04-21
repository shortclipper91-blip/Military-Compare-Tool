"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { formatCompact, formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySelector } from "@/components/CountrySelector";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from "recharts";
import { Activity, TrendingUp, Users } from "lucide-react";

// Mock data based on the SEED data in the DB to ensure visual consistency
// In a production app, this would use fetch() to the /api/countries/:code/timeline endpoint
const MOCK_TIMELINE_DATA: Record<string, any[]> = {
  US: [
    { year: 1995, budget: 272e9, personnel: 1518224 },
    { year: 2000, budget: 294e9, personnel: 1384818 },
    { year: 2005, budget: 503e9, personnel: 1389726 },
    { year: 2010, budget: 698e9, personnel: 1430985 },
    { year: 2015, budget: 596e9, personnel: 1373650 },
    { year: 2020, budget: 778e9, personnel: 1385950 },
    { year: 2023, budget: 886e9, personnel: 1395350 },
  ],
  CN: [
    { year: 1995, budget: 15e9, personnel: 2935000 },
    { year: 2000, budget: 22e9, personnel: 2470000 },
    { year: 2005, budget: 45e9, personnel: 2255000 },
    { year: 2010, budget: 78e9, personnel: 2285000 },
    { year: 2015, budget: 145e9, personnel: 2335000 },
    { year: 2020, budget: 193e9, personnel: 2035000 },
    { year: 2023, budget: 224e9, personnel: 2035000 },
  ],
  RU: [
    { year: 1995, budget: 14e9, personnel: 1520000 },
    { year: 2000, budget: 9e9, personnel: 1004100 },
    { year: 2005, budget: 27e9, personnel: 1027000 },
    { year: 2010, budget: 58e9, personnel: 1046000 },
    { year: 2015, budget: 91e9, personnel: 1013628 },
    { year: 2020, budget: 62e9, personnel: 900000 },
    { year: 2023, budget: 109e9, personnel: 1320000 },
  ]
};

export default function Timeline() {
  const [selected, setSelected] = useState("US");
  const country = COUNTRIES_DATA.find(c => c.code === selected);
  
  // Use mock data for countries that have it, otherwise fallback to personnel
  const data = MOCK_TIMELINE_DATA[selected] || MOCK_TIMELINE_DATA["US"].map(d => ({ 
    ...d, 
    budget: (country?.metrics.defenseBudgetUsd || 0) * (d.budget / 886e9),
    personnel: country?.metrics.activePersonnel || 0
  }));

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Historical Trajectory</h1>
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Longitudinal Capability Analysis (1995-2023)</p>
          </div>
          <div className="w-full md:w-64">
            <CountrySelector 
              label="Select Intelligence Subject"
              value={selected} 
              onChange={setSelected} 
              countries={COUNTRIES_DATA}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-border/50 bg-card/30">
            <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Defense Expenditure (USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263047" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontFamily="monospace"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontFamily="monospace"
                    tickFormatter={(val) => formatCompact(val)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#161b2b", border: "1px solid #263047", fontFamily: "monospace" }}
                    formatter={(val: number) => [formatCurrency(val), "Budget"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorBudget)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xs font-mono uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Active Personnel Scaling
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263047" vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontFamily="monospace"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    fontFamily="monospace"
                    tickFormatter={(val) => formatCompact(val)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#161b2b", border: "1px solid #263047", fontFamily: "monospace" }}
                    formatter={(val: number) => [formatCompact(val), "Personnel"]}
                  />
                  <Line 
                    type="step" 
                    dataKey="personnel" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#161b2b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}