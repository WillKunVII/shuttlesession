
import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PiggybackNoticeProps {
  clearPiggyback: () => void;
}

export function PiggybackNotice({ clearPiggyback }: PiggybackNoticeProps) {
  return (
    <div className="flex items-center justify-between bg-purple-50 border border-purple-200 mt-2 p-2 rounded">
      <span className="flex items-center font-medium text-purple-800 gap-1">
        <Users className="w-5 h-5 mr-1 text-purple-700" />
        Piggyback pair set! Both players will be paired next game.
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="text-purple-600 hover:text-purple-800"
        onClick={clearPiggyback}
      >
        Clear Piggyback
      </Button>
    </div>
  );
}
