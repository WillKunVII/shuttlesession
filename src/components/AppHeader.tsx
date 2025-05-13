
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, Settings } from "lucide-react";

const navItems = [
  { 
    name: "Session", 
    path: "/session", 
    icon: Home 
  },
  { 
    name: "Members", 
    path: "/members", 
    icon: Users 
  },
  { 
    name: "Settings", 
    path: "/settings", 
    icon: Settings 
  },
];

export function AppHeader() {
  return (
    <header className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-neutral-300 bg-neutral-000 safe-area-padding-top">
      <div className="flex items-center gap-2">
        <div className="bg-app-primary-700 p-1 rounded">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L7 12H17L12 6Z" fill="white" />
            <path d="M12 18L7 12H17L12 18Z" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-lg text-neutral-900">ShuttleSession</span>
      </div>
      
      {/* Navigation - consistent across all screen sizes */}
      <nav className="flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.name}
            className={({ isActive }) => cn(
              "flex items-center justify-center transition-colors rounded-md",
              // Larger touch target for mobile accessibility (WCAG 2.2 compliance)
              "min-w-12 min-h-12 p-2", 
              isActive 
                ? "bg-app-primary-700 text-neutral-000" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="hidden sm:inline-block ml-2">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
