"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { FlagIcon } from "./flag-icon";

interface Country {
  code: string;
  name: string;
}

interface CountrySelectorProps {
  countries: Country[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CountrySelector({
  countries,
  value,
  onChange,
  placeholder = "Select country...",
  className,
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between bg-background/50 font-mono text-xs uppercase tracking-wider", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <FlagIcon code={value} size={20} />
                {countries.find((c) => c.code === value)?.name}
              </>
            ) : (
              <>
                <Search className="w-3 h-3 opacity-50" />
                {placeholder}
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search nation..." className="h-9 font-mono text-xs" />
          <CommandList>
            <CommandEmpty className="font-mono text-[10px] uppercase p-4 text-center">No nation found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.code === value ? "" : country.code);
                    setOpen(false);
                  }}
                  className="font-mono text-xs uppercase"
                >
                  <FlagIcon code={country.code} size={20} className="mr-2" />
                  {country.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}