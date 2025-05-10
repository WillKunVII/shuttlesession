
import { BookingCalendar } from "@/components/BookingCalendar";
import { CourtList } from "@/components/CourtList";

export default function BookCourts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Book Courts</h1>
        <p className="text-muted-foreground">Reserve your badminton court</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <BookingCalendar />
        <CourtList />
      </div>
    </div>
  );
}
