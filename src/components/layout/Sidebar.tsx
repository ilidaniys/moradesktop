"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, BarChart3, Settings, CheckSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: CheckSquare },
  { name: "Areas", href: "/areas", icon: LayoutDashboard },
  { name: "Day Builder", href: "/day-builder", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted/30">
      {/* Logo/Title Section */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-medium text-foreground">AI Focus Planner</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 font-normal transition-colors duration-150",
                isActive
                  ? "bg-primary-soft text-primary hover:bg-primary-soft/80"
                  : "text-secondary hover:bg-muted/50"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4">
        <p className="text-xs text-muted">v1.0.0 - MVP</p>
      </div>
    </div>
  );
}
