
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CourtNumberDropdownProps {
  value?: number;
  onChange?: (value: number) => void;
}

export function CourtNumberDropdown({
  value,
  onChange,
}: CourtNumberDropdownProps) {
  const [courtCount, setCourtCount] = useState<number>(() => {
    if (typeof value === "number") return value;
    const savedValue = localStorage.getItem("courtCount");
    return savedValue ? parseInt(savedValue, 10) : 4;
  });

  useEffect(() => {
    if (typeof value === "number") setCourtCount(value);
  }, [value]);

  const handleValueChange = (v: string) => {
    const intVal = parseInt(v, 10);
    setCourtCount(intVal);
    if (onChange) {
      onChange(intVal);
    } else {
      localStorage.setItem("courtCount", intVal.toString());
    }
  };

  return (
    <div className="w-full sm:w-40">
      <Label className="mb-1 block text-foreground font-medium">Courts</Label>
      <Select value={courtCount.toString()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue
            className="text-foreground"
            placeholder="Select courts"
          >
            {courtCount
              ? `${courtCount} ${courtCount === 1 ? "court" : "courts"}`
              : ""}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
            <SelectItem key={number} value={number.toString()}>
              {number} {number === 1 ? "court" : "courts"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
