
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  court: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
}

// Mock data
const bookings: Booking[] = [
  {
    id: "1",
    court: "Court 1",
    date: "Today",
    time: "18:00 - 19:00",
    status: "upcoming"
  },
  {
    id: "2",
    court: "Court 3",
    date: "Tomorrow",
    time: "10:00 - 11:00",
    status: "upcoming"
  },
  {
    id: "3",
    court: "Court 2",
    date: "May 15",
    time: "15:00 - 16:00",
    status: "upcoming"
  }
];

export function UpcomingBookings() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      
      <div className="space-y-3">
        {bookings.map(booking => (
          <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div>
              <p className="font-medium">{booking.court}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{booking.date}</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {booking.time}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-shuttle-lightBlue border-shuttle-blue text-shuttle-blue">
                Upcoming
              </Badge>
              <Button variant="ghost" size="sm" className="text-shuttle-red">
                Cancel
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
