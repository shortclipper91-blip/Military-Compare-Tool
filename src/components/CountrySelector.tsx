"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, Search, Target, ChevronDown } from "lucide-react";
import { FlagIcon } from "./flag-icon";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  exclude?: string[];
  className?: string;
  label?: string;
  countries: any[]; // New prop
}

export function CountrySelector({
  value,
  onChange,
  placeholder = "Select nation...",
  exclude = [],
  className,
  label,
  countries,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedCountry = countries.find((c) => c.code === value);
  const isMobile = useIsMobile();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground px-1">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-none border border-border bg-card/50 px-4 py-2 text-sm transition-all hover:bg-accent/50 hover:border-primary/50 group focus:outline-none focus:ring-1 focus:ring-primary/30",
              open && "border-primary/50 bg-accent/50"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedCountry ? (
                <div className="flex items-center gap-3 overflow-hidden">
                  <FlagIcon code={selectedCountry.code} size={20} className="shrink-0 grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                  <span className="truncate font-bold uppercase tracking-tight font-mono">
                    {selectedCountry.name}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                  {placeholder}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <div className="h-4 w-[1px] bg-border/50" />
              <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform duration-200", open && "rotate-180 opacity-100 text-primary")} />
            </div>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[240px] overflow-hidden rounded-none border border-primary/30 bg-card text-popover-foreground shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150"
            align="start"
            sideOffset={4}
          >
            <Command className="flex h-full w-full flex-col overflow-hidden bg-card">
              <div className="flex items-center border-b border-border px-3 bg-accent/20" cmdk-input-wrapper="">
                <Search className="mr-2 h-4 w-4 shrink-0 text-primary opacity-70" />
                <Command.Input
                  placeholder="Filter by nation name or code..."
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground font-mono"
                />
              </div>
              <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
                <Command.Empty className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Target className="w-8 h-8" />
                    <span className="text-xs font-mono uppercase tracking-widest">No Intel Found</span>
                  </div>
                </Command.Empty>
                <Command.Group>
                  {countries
                    .filter((c) => !exclude.includes(c.code))
                    .map((country) => (
                      <Command.Item
                        key={country.code}
                        value={country.name}
                        onSelect={() => {
                          onChange(country.code);
                          setOpen(false);
                        }}
                        className="relative flex cursor-pointer select-none items-center rounded-none px-3 py-2.5 text-sm outline-none aria-selected:bg-primary/10 aria-selected:text-primary transition-colors border-l-2 border-transparent aria-selected:border-primary"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FlagIcon code={country.code} size={18} />
                          <div className="flex flex-col">
                            <span className="font-bold uppercase tracking-tight font-mono">
                              {country.name}
                            </span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase mt-1">
                              {country.region}
                            </span>
                          </div>
                        </div>
                        {value === country.code && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        )}
                      </Command.Item>
                    ))}
                </Command.Group>
              </Command.List>
              <div className="border-t border-border p-2 bg-accent/10">
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest text-center">
                  STRATCOM Database v4.2.0
                </div>
              </div>
            </Command>
          </Popover.Portal>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}