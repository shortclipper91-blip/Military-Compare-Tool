import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Crosshair, Users, Map, Shield, ShieldAlert, Menu, X } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Head-to-Head", icon: Shield },
    { href: "/coalition", label: "Coalition Builder", icon: Users },
    { href: "/map", label: "Strength Map", icon: Map },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="w-64 border-r border-border bg-card shrink-0 flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <Crosshair className="w-6 h-6 text-primary mr-3" />
          <h1 className="font-bold text-foreground tracking-tight uppercase text-sm">
            STRATCOM<span className="text-primary">.NET</span>
          </h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                  location.pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${location.pathname === item.href ? "text-primary" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}