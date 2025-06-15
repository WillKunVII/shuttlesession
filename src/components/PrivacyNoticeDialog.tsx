
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PrivacyNoticeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacy Notice</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This app stores player and game information locally in your browser for session management. No data is transmitted or stored on external servers. You are in full control of your data, which you may clear at any time from the Settings page.
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
