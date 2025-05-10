
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "bg-app-primary-700 text-neutral-000 flex flex-col h-screen transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center p-4 justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-neutral-000 p-1 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6L7 12H17L12 6Z" fill="#00702A" />
                <path d="M12 18L7 12H17L12 18Z" fill="#00702A" />
              </svg>
            </div>
            <span className="font-bold text-lg">ShuttleSession</span>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-app-primary-900 text-neutral-000"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <div className="flex flex-col flex-1 mt-6 gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-neutral-000 text-app-primary-700" 
                : "hover:bg-app-primary-900",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <item.icon size={20} className={cn(collapsed ? "mx-0" : "mr-2")} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4">
        <Button 
          variant="ghost" 
          className={cn(
            "text-neutral-000 hover:bg-app-primary-900 w-full",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut size={20} className={cn(collapsed ? "mx-0" : "mr-2")} />
          {!collapsed && <span>Log Out</span>}
        </Button>
      </div>
    </div>
  );
}
