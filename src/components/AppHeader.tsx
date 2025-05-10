
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { 
    name: "Session", 
    path: "/", 
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
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-shuttle-primary p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6L7 12H17L12 6Z" fill="white" />
              <path d="M12 18L7 12H17L12 18Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-lg hidden sm:inline-block">ShuttleSession</span>
        </div>
        
        <nav className="hidden md:flex items-center ml-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md",
                isActive 
                  ? "bg-shuttle-primary text-white" 
                  : "hover:bg-gray-100"
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center">
        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

// Import icons
import { Home, Users, Settings } from "lucide-react";
