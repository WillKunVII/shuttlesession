
import { CalendarDays, Clock, Users, CheckCircle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

function StatCard({ title, value, icon, description, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Bookings"
        value="128"
        description="↑ 12% from last month"
        color="bg-shuttle-lightBlue text-shuttle-blue"
        icon={<CalendarDays size={24} />}
      />
      <StatCard
        title="Total Hours"
        value="256"
        description="↑ 8% from last month"
        color="bg-shuttle-yellow bg-opacity-20 text-shuttle-yellow"
        icon={<Clock size={24} />}
      />
      <StatCard
        title="Active Members"
        value="64"
        description="↑ 5% from last month"
        color="bg-shuttle-green bg-opacity-20 text-shuttle-green"
        icon={<Users size={24} />}
      />
      <StatCard
        title="Occupancy Rate"
        value="78%"
        description="↑ 3% from last month"
        color="bg-shuttle-red bg-opacity-20 text-shuttle-red"
        icon={<CheckCircle size={24} />}
      />
    </div>
  );
}
