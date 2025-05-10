
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  format, 
  addDays, 
  startOfWeek, 
  isSameDay, 
  addWeeks, 
  subWeeks,
  isToday
} from "date-fns";

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const prevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Generate dates for the week
  const weekDates = Array.from({ length: 7 }).map((_, i) => 
    addDays(currentWeekStart, i)
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Select Date</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={prevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((date) => (
          <Button
            key={date.toString()}
            variant="ghost"
            className={cn(
              "flex flex-col h-auto py-3 hover:bg-shuttle-lightBlue",
              isSameDay(date, selectedDate) && "bg-shuttle-blue text-white hover:bg-shuttle-darkBlue",
              isToday(date) && !isSameDay(date, selectedDate) && "border-shuttle-blue text-shuttle-blue"
            )}
            onClick={() => setSelectedDate(date)}
          >
            <span className="text-xs font-medium mb-1">
              {format(date, "E")}
            </span>
            <span className={cn(
              "text-2xl font-semibold",
              isSameDay(date, selectedDate) ? "text-white" : "text-gray-900"
            )}>
              {format(date, "d")}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
