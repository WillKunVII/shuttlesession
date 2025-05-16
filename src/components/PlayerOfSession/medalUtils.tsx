
import { Trophy, Medal, Award } from "lucide-react";
import React from "react";

export function getMedalDisplay(index: number): { 
  icon: React.ReactNode, 
  color: string, 
  name: string 
} {
  switch (index) {
    case 0:
      return {
        icon: <Trophy className="h-8 w-8 text-yellow-500" />,
        color: "text-yellow-500",
        name: "Gold"
      };
    case 1:
      return {
        icon: <Medal className="h-8 w-8 text-gray-400" />,
        color: "text-gray-400",
        name: "Silver"
      };
    case 2:
      return {
        icon: <Award className="h-8 w-8 text-amber-700" />,
        color: "text-amber-700",
        name: "Bronze"
      };
    default:
      return {
        icon: null,
        color: "",
        name: ""
      };
  }
}
