import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Crosshair, Users, Map, Shield, ShieldAlert, Menu, X } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Head-to-Head", icon: Shield },
    { href: "/coalition", label: "Coalition Builder", icon: Users },
    { href: "/map", label: "Strength Map", icon: Map },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="w-64 border-r border-sidebar-border bg-sidebar shrink-0 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <Crosshair className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-bold text-sidebar-foreground tracking-tight uppercase text-sm">
            STRATCOM<span className="text-primary">.NET</span>
          </h1>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-xs font-mono text-sidebar-foreground/50 mb-4 px-2 uppercase tracking-wider">
              Analysis Modules
            </div>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                  location === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${location === item.href ? "text-primary" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center px-3 py-2 text-xs text-sidebar-foreground/50 font-mono bg-sidebar-accent/30 rounded border border-sidebar-border/50">
            <ShieldAlert className="w-3 h-3 mr-2 text-yellow-500" />
            UNCLASSIFIED
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Topbar */}
        <div className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:hidden shrink-0 z-20">
          <div className="flex items-center">
            <Crosshair className="w-5 h-5 text-primary mr-2" />
            <h1 className="font-bold text-foreground tracking-tight uppercase text-sm">
              STRATCOM<span className="text-primary">.NET</span>
            </h1>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {mobileOpen && (
          <div className="absolute inset-0 top-14 z-30 md:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative bg-card border-b border-border shadow-xl p-4 space-y-1">
              <div className="text-xs font-mono text-muted-foreground/50 mb-3 px-2 uppercase tracking-wider">
                Analysis Modules
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                    location === item.href
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${location === item.href ? "text-primary" : ""}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center px-3 py-2 text-xs text-muted-foreground font-mono bg-accent/30 rounded border border-border/50">
                  <ShieldAlert className="w-3 h-3 mr-2 text-yellow-500" />
                  UNCLASSIFIED
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subtle noise overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\"0 0 200 200\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cfilter id=\\"noiseFilter\\"%3E%3CfeTurbulence type=\\"fractalNoise\\" baseFrequency=\\"0.65\\" numOctaves=\\"3\\" stitchTiles=\\"stitch\\"/%3E%3C/filter%3E%3Crect width=\\"100%25\\" height=\\"100%25\\" filter=\\"url(%23noiseFilter)\\"/%3E%3C/svg%3E")' }}></div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
