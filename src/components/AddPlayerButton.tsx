import { useState, useEffect, useRef } from "react";
import { Plus, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Member, PlayPreference } from "@/types/member";
import { toast } from "sonner";
import { MemberSearchList } from "./AddPlayer/MemberSearchList";
import { CreateMemberForm } from "./AddPlayer/CreateMemberForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AddPlayerButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  onAddPlayer?: (player: {
    name: string;
    gender: "male" | "female";
    isGuest: boolean;
    playPreferences: PlayPreference[];
  }) => void;
}

export function AddPlayerButton({
  variant = "outline",
  onAddPlayer,
}: AddPlayerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeSessionNames, setActiveSessionNames] = useState<Set<string>>(
    new Set()
  );
  const createFormRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to create form when it expands
  useEffect(() => {
    if (showCreateForm && createFormRef.current) {
      setTimeout(() => {
        createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showCreateForm]);

  // Load members and aggregate ALL active player names (queue, next game, courts)
  useEffect(() => {
    if (!isOpen) return;

    const savedMembers = localStorage.getItem("clubMembers");
    if (savedMembers) {
      try {
        setMembersList(JSON.parse(savedMembers));
      } catch (e) {
        console.error("Error parsing members from localStorage", e);
      }
    }

    // Get player queue
    let queuePlayers: any[] = [];
    const playerQueue = localStorage.getItem("playerQueue");
    if (playerQueue) {
      try {
        queuePlayers = JSON.parse(playerQueue);
      } catch (e) {
        queuePlayers = [];
      }
    }

    // Get 'Next Game' players
    let nextGamePlayers: any[] = [];
    const ng = localStorage.getItem("nextGamePlayers");
    if (ng) {
      try {
        nextGamePlayers = JSON.parse(ng);
      } catch (e) {
        nextGamePlayers = [];
      }
    }

    // Get all court players
    let courtPlayers: any[] = [];
    const courtsRaw = localStorage.getItem("courts");
    if (courtsRaw) {
      try {
        const courtsParsed = JSON.parse(courtsRaw);
        if (Array.isArray(courtsParsed)) {
          for (const court of courtsParsed) {
            if (Array.isArray(court.players)) {
              courtPlayers = courtPlayers.concat(court.players);
            }
          }
        }
      } catch (e) {
        courtPlayers = [];
      }
    }

    // Combine all names
    const allNames = [
      ...(Array.isArray(queuePlayers) ? queuePlayers : []),
      ...(Array.isArray(nextGamePlayers) ? nextGamePlayers : []),
      ...(Array.isArray(courtPlayers) ? courtPlayers : []),
    ]
      .map((p: any) => (p.name || "").trim().toLowerCase())
      .filter(Boolean);

    setActiveSessionNames(new Set(allNames));
  }, [isOpen]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowCreateForm(false);
    }
  }, [isOpen]);

  const handleSelectExistingMember = (member: Member) => {
    // Check if already in session
    if (activeSessionNames.has(member.name.trim().toLowerCase())) {
      toast.error(`${member.name} is already in this session!`);
      return;
    }

    if (onAddPlayer) {
      onAddPlayer({
        name: member.name,
        gender: member.gender,
        isGuest: member.isGuest,
        playPreferences: member.playPreferences || [],
      });
    }

    toast.success(`${member.name} added to queue`);
    setIsOpen(false);
  };

  const handleCreateNewMember = (data: {
    name: string;
    gender: "male" | "female";
    isGuest: boolean;
    playPreferences: PlayPreference[];
  }) => {
    const trimmedName = data.name.trim();

    // Check if already in session
    if (activeSessionNames.has(trimmedName.toLowerCase())) {
      toast.error(`${trimmedName} is already in this session!`);
      return;
    }

    // Check if member already exists
    const existingMember = membersList.find(
      (m) => m.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (!existingMember) {
      // Create new member
      const newMember: Member = {
        id: Date.now(),
        name: trimmedName,
        gender: data.gender,
        isGuest: data.isGuest,
        wins: 0,
        losses: 0,
        playPreferences: data.playPreferences,
        rating: 1000,
      };

      const updatedMembers = [...membersList, newMember];
      setMembersList(updatedMembers);

      localStorage.setItem("clubMembers", JSON.stringify(updatedMembers));
      localStorage.setItem("members", JSON.stringify(updatedMembers));

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "clubMembers",
          newValue: JSON.stringify(updatedMembers),
        })
      );

      toast.success(`${trimmedName} added to members database`);
    }

    // Add to queue
    if (onAddPlayer) {
      onAddPlayer(data);
    }

    toast.success(`${trimmedName} added to queue`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant={variant}>
          <Plus size={16} className="mr-2" />
          Add Player
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Player to Queue</SheetTitle>
          <SheetDescription>
            Select an existing member or create a new one
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 py-4 space-y-4 overflow-y-auto flex flex-col">
          {/* Search Section - Primary */}
          <div className="space-y-3">
            <Label htmlFor="search-member" className="text-sm font-medium">
              Search Members
            </Label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="search-member"
                placeholder="Type a name to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoComplete="off"
              />
            </div>

            {/* Member List */}
            <MemberSearchList
              members={membersList}
              searchQuery={searchQuery}
              sessionNameSet={activeSessionNames}
              onSelectMember={handleSelectExistingMember}
            />
          </div>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Create New Section - Secondary */}
          <Collapsible open={showCreateForm} onOpenChange={setShowCreateForm}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>Player not in the list? Create new member</span>
                {showCreateForm ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4" ref={createFormRef}>
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <CreateMemberForm
                  initialName={searchQuery}
                  existingMembers={membersList}
                  onSubmit={handleCreateNewMember}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </SheetContent>
    </Sheet>
  );
}
