import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Users, Map, Crosshair, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const [isLight, setIsLight] = useState(() => {
    return !document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  const navItems = [
    { href: "/", label: "Head‑to‑Head", icon: Shield },
    { href: "/coalition", label: "Coalition Builder", icon: Users },
    { href: "/map", label: "Strength Map", icon: Map },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Crosshair className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-bold tracking-tighter uppercase text-sm">
            STRATCOM<span className="text-primary">.INTEL</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-md transition-all text-sm font-medium",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn("w-4 h-4 mr-3", location.pathname === item.href && "text-primary")} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center px-3 py-2 text-[10px] font-mono text-yellow-500 bg-yellow-500/5 border border-yellow-500/20 rounded">
            <ShieldAlert className="w-3 h-3 mr-2" />
            UNCLASSIFIED // OPEN SOURCE
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/%3E%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/%3E%3C/svg%3E")' }}></div>
        <div className="max-w-7xl mx-auto p-6 md:p-10 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}