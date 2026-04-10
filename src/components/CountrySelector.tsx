"use client";

import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { FlagIcon } from "./flag-icon";
import { Country, COUNTRIES_DATA } from "@/lib/countryData";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  exclude?: string[];
  className?: string;
}

export function CountrySelector({ value, onChange, placeholder = "Select country...", exclude = [], className }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedCountry = COUNTRIES_DATA.find((c) => c.code === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:bg-accent/50",
            className
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedCountry ? (
              <>
                <FlagIcon code={selectedCountry.code} size={24} className="shrink-0" />
                <span className="truncate font-bold uppercase tracking-tight">{selectedCountry.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-md border border-border bg-card text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-100"
          align="start"
          sideOffset={4}
        >
          <Command className="flex h-full w-full flex-col overflow-hidden">
            <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Search nations..."
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">No nation found.</Command.Empty>
              <Command.Group>
                {COUNTRIES_DATA.filter(c => !exclude.includes(c.code)).map((country) => (
                  <Command.Item
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      onChange(country.code);
                      setOpen(false);
                    }}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FlagIcon code={country.code} size={20} />
                      <span className="font-medium uppercase tracking-tight">{country.name}</span>
                    </div>
                    {value === country.code && <Check className="h-4 w-4 text-primary" />}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}