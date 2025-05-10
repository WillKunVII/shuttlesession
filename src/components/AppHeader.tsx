
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
    <header className="flex items-center justify-between p-3 border-b border-neutral-300 bg-neutral-000">
      <div className="flex items-center gap-2">
        <div className="bg-app-primary-700 p-1 rounded">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L7 12H17L12 6Z" fill="white" />
            <path d="M12 18L7 12H17L12 18Z" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-lg hidden sm:inline-block text-neutral-900">ShuttleSession</span>
      </div>
      
      {/* Show navigation on tablet and desktop - changed from md:flex to sm:flex */}
      <nav className="hidden sm:flex items-center gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
              isActive 
                ? "bg-app-primary-700 text-neutral-000" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}
          >
            <item.icon className="mr-2 h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile menu trigger - changed from md:hidden to sm:hidden */}
      <div className="sm:hidden">
        <button className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>
  );
}
