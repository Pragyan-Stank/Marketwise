"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Activity, Eye, BarChart3, DotSquare as LogSquare } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    href: "/dashboard",
    icon: Activity,
    label: "Dashboard",
  },
  {
    href: "/monitor",
    icon: Eye,
    label: "Live Monitor",
  },
  {
    href: "/logs",
    icon: LogSquare,
    label: "Detection Logs",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        className,
      )}
    >
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 font-bold">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && <span className="text-sidebar-foreground">SafetyMonitor</span>}
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full p-2 text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-lg transition-colors"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>
    </aside>
  )
}
