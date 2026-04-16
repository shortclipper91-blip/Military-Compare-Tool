"use client";

import React, { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { FlagIcon } from "@/components/flag-icon";
import { CountrySelector } from "@/components/CountrySelector";
import { COUNTRIES_DATA } from "@/lib/countryData";
import { calculateScores, DEFAULT_WEIGHTS } from "@/lib/scoring";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {   Users, 
  Plane,   Target,   Anchor,   DollarSign, 
  Zap,   ArrowRightLeft,   ShieldCheck,   Info,
  Database,
  Shield
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import METRIC_DESCRIPTIONS from "@/lib/metricDescriptions";
import { cn } from "@/lib/utils";

const BRAVO_COLOR = "hsl(var(--chart-4))";
const ALPHA_COLOR = "hsl(var(--primary))";

export default function Index() {
  // Initialize selected country codes with default values
  const [selected, setSelected] = useState<string[]>(["US", "CN"]);

  // ... existing state and logic ...

  // Calculate scores first
  const scores = useMemo(() => calculateScores(COUNTRIES_DATA), []);
  const scoreA = useMemo(() => scores.find((s) => s.code === selected[0]), [scores, selected]);
  const scoreB = useMemo(() => scores.find((s) => s.code === selected[1]), [scores, selected]);

  // Then create radar data using the defined scores
  const radarData = useMemo(() => {
    if (!scoreA || !scoreB) return [];
    return [
      { category: "Manpower", A: scoreA.categories.manpower, B: scoreB.categories.manpower },
      { category: "Air Power", A: scoreA.categories.airPower, B: scoreB.categories.airPower },
      { category: "Ground", A: scoreA.categories.groundForces, B: scoreB.categories.groundForces },
      { category: "Naval", A: scoreA.categories.navalForces, B: scoreB.categories.navalForces },
      { category: "Economy", A: scoreA.categories.economy, B: scoreB.categories.economy },
    ];
  }, [scoreA, scoreB]);

  return (
    <Layout>
      {/* ... existing header and metrics section ... */}

      {/* ... existing index card ... */}

      {/* Capability Matrix Card */}
      <Card className="border-border/50 bg-card/30 rounded-none radar-chart-container">
        <CardHeader className="bg-accent/5 border-b border-border/50">
          <CardTitle className="text-xs font-mono uppercase tracking-wider">Capability Matrix</CardTitle>
        </CardHeader>
        <CardContent className="h-[340px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              {/* Enhanced colors for better visibility */}
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeDasharray="3 3" 
                strokeWidth={1.5} 
              />
              <PolarAngleAxis
                dataKey="category"
                tick={{ 
                  fill: "hsl(var(--muted-foreground))", 
                  fontSize: 10, 
                  fontFamily: "monospace", 
                  fontWeight: "bold" 
                }}
              />
              {/* Alpha line with distinct color */}
              <Radar 
                name={countryA?.name} 
                dataKey="A" 
                stroke={ALPHA_COLOR} 
                fill={ALPHA_COLOR} 
                fillOpacity={0.25} 
                strokeWidth={3} 
                activeShape={{ type: "circle", r: 4 }}                                activeShapeFill={ALPHA_COLOR} 
                activeShapeStroke={ALPHA_COLOR} 
              />
              {/* Bravo line with distinct color */}
              <Radar 
                name={countryB?.name} 
                dataKey="B" 
                stroke={BRAVO_COLOR} 
                fill={BRAVO_COLOR} 
                fillOpacity={0.35} 
                strokeWidth={3} 
                activeShape={{ type: "circle", r: 4 }}                
                activeShapeFill={BRAVO_COLOR}                                activeShapeStroke={BRAVO_COLOR} 
              />
              {/* Enhanced tooltip styling */}
              <RechartsTooltip                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  borderRadius: "4px",
                }}
                itemStyle={{ 
                  textTransform: "uppercase", 
                  fontWeight: "bold",
                  fontSize: "11px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Layout>
  );
}