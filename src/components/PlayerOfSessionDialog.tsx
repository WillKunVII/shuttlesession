
import { useState, useEffect } from "react";
import { getStorageItem } from "@/utils/storageUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PlayerRankings } from "./PlayerOfSession/PlayerRankings";
import { useSessionScores } from "@/hooks/useSessionScores";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlayerOfSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerOfSessionDialog({ isOpen, onClose }: PlayerOfSessionDialogProps) {
  const { topPlayers, hasScores } = useSessionScores(isOpen);
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="py-6 space-y-6 text-sm sm:text-base">
        <PlayerRankings topPlayers={topPlayers} />
      </div>
      
      <div className="pt-4">
        <Button onClick={onClose} className="w-full text-sm sm:text-base">
          Close
        </Button>
      </div>
    </>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen && hasScores} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl sm:text-2xl md:text-3xl">Player of the Session</DrawerTitle>
            <DrawerDescription className="text-center text-sm sm:text-base">
              Congratulations to our top players of this session!
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop/Tablet: Use Sheet
  return (
    <Sheet open={isOpen && hasScores} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-xl sm:text-2xl md:text-3xl">Player of the Session</SheetTitle>
          <SheetDescription className="text-center text-sm sm:text-base">
            Congratulations to our top players of this session!
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
