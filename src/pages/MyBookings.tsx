
import { useState } from "react";
import { CalendarDays, Clock, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Mock data
const bookings = [
  {
    id: "1",
    court: "Court 1",
    date: "May 10, 2025",
    time: "18:00 - 19:00",
    location: "Indoor",
    status: "upcoming",
    price: 15,
  },
  {
    id: "2",
    court: "Court 3",
    date: "May 12, 2025",
    time: "10:00 - 11:00",
    location: "Outdoor",
    status: "upcoming",
    price: 12,
  },
  {
    id: "3",
    court: "Court 2",
    date: "May 5, 2025",
    time: "15:00 - 16:00",
    location: "Indoor",
    status: "completed",
    price: 15,
  },
  {
    id: "4",
    court: "Court 1",
    date: "May 3, 2025",
    time: "09:00 - 10:00",
    location: "Indoor",
    status: "cancelled",
    price: 15,
  }
];

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your court reservations</p>
      </div>
      
      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className={`p-3 text-white ${
                    booking.status === 'upcoming' 
                      ? 'bg-shuttle-blue' 
                      : booking.status === 'completed' 
                        ? 'bg-shuttle-green' 
                        : 'bg-shuttle-red'
                  }`}
                >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{booking.court}</h3>
                      <Badge variant={booking.status === 'upcoming' ? 'default' : 'outline'}>
                        {booking.status === 'upcoming' 
                          ? 'Upcoming' 
                          : booking.status === 'completed' 
                            ? 'Completed' 
                            : 'Cancelled'
                        }
                      </Badge>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{booking.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{booking.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Court Type</p>
                      <p className="text-sm text-muted-foreground">{booking.location}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t mt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-semibold">${booking.price}</p>
                      </div>
                      {booking.status === 'upcoming' && (
                        <Button variant="outline" size="sm" className="text-shuttle-red">
                          <X size={16} className="mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
