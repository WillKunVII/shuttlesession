import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, Settings } from "lucide-react";
const navItems = [{
  name: "Session",
  path: "/session",
  icon: Home
}, {
  name: "Members",
  path: "/members",
  icon: Users
}, {
  name: "Settings",
  path: "/settings",
  icon: Settings
}];
export function AppHeader() {
  return <header className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-neutral-300 bg-neutral-000 safe-area-padding-top">
      <div className="flex items-center gap-2">
        <div className="bg-app-primary-700 p-1 rounded w-8 h-8 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 28 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-75">
            <path d="M19.9979 21.9689C20.2486 23.733 21.4717 32.6751 21.2991 38.4443C21.0873 45.5213 18.6988 55.9979 17.6584 56C16.6181 55.9984 14.7354 46.1715 14.5236 39.0943C14.3561 33.4971 15.0302 24.4183 15.2064 22.1742C16.7473 22.1431 18.4647 22.0592 19.9979 21.9689Z" fill="white" />
            <path d="M8.19579 21.9802C9.74317 22.0698 11.4593 22.1505 12.9843 22.1773C13.124 24.3632 13.6427 32.9917 13.4759 38.566C13.2642 45.6434 11.5818 55.4707 10.5415 55.4717C9.5011 55.4697 7.1126 44.993 6.90079 37.916C6.72907 32.1771 7.93648 23.7197 8.19579 21.9802Z" fill="white" />
            <path d="M3.53298 21.6604C3.53298 21.6604 4.81379 21.763 6.59519 21.8802C6.29566 22.7214 5.25841 25.9382 5.10395 30.6415C4.90465 36.7101 1.37427 42.2614 0.394125 42.2642C-0.585003 42.2642 0.593467 35.655 0.394125 29.5849C0.235801 24.7639 2.75778 22.3125 3.39091 21.7749L3.53298 21.6604Z" fill="white" />
            <path d="M24.6188 21.7821C25.2695 22.3353 27.7639 24.7909 27.6064 29.5849C27.4071 35.6535 28.5843 42.2609 27.6064 42.2642C26.6273 42.2642 23.096 36.7116 22.8966 30.6415C22.7423 25.9423 21.7071 22.723 21.4064 21.8802C22.1929 21.8284 22.8818 21.7821 23.4056 21.7429L24.4655 21.6604L24.6188 21.7821Z" fill="white" />
            <path d="M24.4655 20.6038C24.4158 20.6079 18.0765 21.132 14.0003 21.1321C9.90768 21.1321 3.53298 20.6038 3.53298 20.6038V19.5472C3.53298 19.5472 9.90768 20.0755 14.0003 20.0755C18.0765 20.0754 24.4158 19.5513 24.4655 19.5472V20.6038Z" fill="white" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.0003 0C19.7803 0.000392716 24.4666 4.73082 24.4666 10.566V18.4906C24.4666 18.4906 18.0927 19.0188 14.0003 19.0189C9.92442 19.0189 3.5853 18.4948 3.53401 18.4906V10.566C3.53401 4.73058 8.21992 0 14.0003 0ZM12.9537 7.00722C12.3756 7.00722 11.907 8.12735 11.907 9.50943C11.907 10.8915 12.3756 12.0116 12.9537 12.0116C13.5314 12.0107 14.0003 10.8909 14.0003 9.50943C14.0003 8.12792 13.5314 7.00815 12.9537 7.00722ZM18.1868 7.00722C17.6088 7.00722 17.1402 8.12735 17.1402 9.50943C17.1402 10.8915 17.6088 12.0116 18.1868 12.0116C18.7645 12.0107 19.2334 10.8909 19.2334 9.50943C19.2334 8.12793 18.7645 7.00815 18.1868 7.00722Z" fill="white" />
          </svg>
        </div>
        <span className="font-bold text-lg text-neutral-900">ShuttleSession</span>
      </div>
      
      {/* Navigation - consistent across all screen sizes */}
      <nav className="flex items-center gap-2">
        {navItems.map(item => <NavLink key={item.path} to={item.path} aria-label={item.name} className={({
        isActive
      }) => cn("flex items-center justify-center transition-colors rounded-md",
      // Larger touch target for mobile accessibility (WCAG 2.2 compliance)
      "min-w-12 min-h-12 p-2", isActive ? "bg-app-primary-700 text-neutral-000" : "text-neutral-700 hover:bg-neutral-100")}>
            <item.icon className="h-6 w-6" />
            <span className="hidden sm:inline-block ml-2">{item.name}</span>
          </NavLink>)}
      </nav>
    </header>;
}