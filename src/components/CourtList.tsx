
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  price: number;
}

interface Court {
  id: string;
  name: string;
  type: string;
  timeSlots: TimeSlot[];
}

// Mock data
const courts: Court[] = [
  {
    id: "1",
    name: "Court 1",
    type: "Indoor",
    timeSlots: [
      { id: "1-1", time: "08:00 - 09:00", available: true, price: 15 },
      { id: "1-2", time: "09:00 - 10:00", available: false, price: 15 },
      { id: "1-3", time: "10:00 - 11:00", available: true, price: 20 },
      { id: "1-4", time: "11:00 - 12:00", available: true, price: 20 },
      { id: "1-5", time: "12:00 - 13:00", available: false, price: 20 },
      { id: "1-6", time: "13:00 - 14:00", available: true, price: 15 },
    ]
  },
  {
    id: "2",
    name: "Court 2",
    type: "Indoor",
    timeSlots: [
      { id: "2-1", time: "08:00 - 09:00", available: false, price: 15 },
      { id: "2-2", time: "09:00 - 10:00", available: true, price: 15 },
      { id: "2-3", time: "10:00 - 11:00", available: true, price: 20 },
      { id: "2-4", time: "11:00 - 12:00", available: false, price: 20 },
      { id: "2-5", time: "12:00 - 13:00", available: true, price: 20 },
      { id: "2-6", time: "13:00 - 14:00", available: true, price: 15 },
    ]
  },
  {
    id: "3",
    name: "Court 3",
    type: "Outdoor",
    timeSlots: [
      { id: "3-1", time: "08:00 - 09:00", available: true, price: 12 },
      { id: "3-2", time: "09:00 - 10:00", available: true, price: 12 },
      { id: "3-3", time: "10:00 - 11:00", available: false, price: 15 },
      { id: "3-4", time: "11:00 - 12:00", available: true, price: 15 },
      { id: "3-5", time: "12:00 - 13:00", available: false, price: 15 },
      { id: "3-6", time: "13:00 - 14:00", available: true, price: 12 },
    ]
  },
];

export function CourtList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Available Courts</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-shuttle-green rounded-full"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-shuttle-mediumGray rounded-full"></div>
            <span className="text-sm">Booked</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {courts.map(court => (
          <div key={court.id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-lg">{court.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{court.type}</Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {court.timeSlots.map(slot => (
                <Button
                  key={slot.id}
                  variant={slot.available ? "outline" : "ghost"}
                  disabled={!slot.available}
                  className={cn(
                    "flex flex-col h-auto py-3 border",
                    slot.available 
                      ? "hover:bg-shuttle-lightBlue hover:border-shuttle-blue" 
                      : "bg-gray-100 border-gray-200 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-1 text-xs mb-1">
                    <Clock size={12} />
                    <span>{slot.time}</span>
                  </div>
                  <div className="font-semibold">${slot.price}</div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
