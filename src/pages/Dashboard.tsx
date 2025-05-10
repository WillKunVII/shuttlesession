
import { DashboardStats } from "@/components/DashboardStats";
import { BookingChart } from "@/components/BookingChart";
import { UpcomingBookings } from "@/components/UpcomingBookings";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to ShuttleCourts</p>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BookingChart />
        </div>
        <div className="lg:col-span-1">
          <UpcomingBookings />
        </div>
      </div>
    </div>
  );
}
