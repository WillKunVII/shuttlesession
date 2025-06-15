import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetClose, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Member, PlayPreference } from "@/types/member";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { GenderRadioGroup } from "./AddPlayer/GenderRadioGroup";
import { PlayPreferencesSelector } from "./AddPlayer/PlayPreferencesSelector";
import { PlayerSuggestions } from "./AddPlayer/PlayerSuggestions";

interface AddPlayerButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean, playPreferences: PlayPreference[]}) => void;
}

export function AddPlayerButton({ variant = "outline", onAddPlayer }: AddPlayerButtonProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isGuest, setIsGuest] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [playPreferences, setPlayPreferences] = useState<PlayPreference[]>([]);
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);
  const [activeQueue, setActiveQueue] = useState<{ name: string; }[]>([]);
  const [activeSessionNames, setActiveSessionNames] = useState<Set<string>>(new Set());

  // Load members and aggregate ALL active player names (queue, next game, courts)
  useEffect(() => {
    const savedMembers = localStorage.getItem("clubMembers");
    if (savedMembers) {
      try {
        setMembersList(JSON.parse(savedMembers));
      } catch (e) {
        console.error("Error parsing members from localStorage", e);
      }
    }

    const enablePref = localStorage.getItem("enablePlayerPreferences");
    setPreferencesEnabled(enablePref === "true");

    // Get player queue (names, case-insensitive)
    let queuePlayers: any[] = [];
    const playerQueue = localStorage.getItem("playerQueue");
    if (playerQueue) {
      try {
        queuePlayers = JSON.parse(playerQueue);
        setActiveQueue(Array.isArray(queuePlayers) ? queuePlayers : []);
      } catch (e) {
        setActiveQueue([]);
      }
    } else {
      setActiveQueue([]);
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

    // Get all court players (from 'courts')
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

    // Combine all names (queue, next game, courts)
    const allNames = [
      ...(Array.isArray(queuePlayers) ? queuePlayers : []),
      ...(Array.isArray(nextGamePlayers) ? nextGamePlayers : []),
      ...(Array.isArray(courtPlayers) ? courtPlayers : []),
    ]
      .map((p: any) => (p.name || "").trim().toLowerCase())
      .filter(Boolean);

    setActiveSessionNames(new Set(allNames));
  }, [isOpen]);

  const handleAddPlayer = () => {
    if (name && onAddPlayer) {
      // Prevent duplicates by checking name against ALL involved players (queue, nextGame, courts)
      const dup = activeSessionNames.has(name.trim().toLowerCase());
      if (dup) {
        toast.error(`${name} is already participating in this session!`);
        return;
      }

      // Check queue for duplicates by name (case-insensitive)
      const existingMember = membersList.find(
        member => member.name.toLowerCase() === name.toLowerCase()
      );

      // If player doesn't exist in members list, add them
      if (!existingMember) {
        // Create new member object
        const newMember: Member = {
          id: Date.now(),
          name,
          gender,
          isGuest,
          wins: 0,
          losses: 0,
          playPreferences: preferencesEnabled ? playPreferences : undefined
        };

        // Add to members list
        const updatedMembers = [...membersList, newMember];
        setMembersList(updatedMembers);

        // Save to localStorage
        localStorage.setItem("clubMembers", JSON.stringify(updatedMembers));

        // Show toast notification
        toast.success(`${name} added to members database`);
      }

      // Add player to queue (original functionality)
      onAddPlayer({
        name,
        gender,
        isGuest,
        playPreferences: preferencesEnabled ? playPreferences : []
      });

      // Reset form
      setName("");
      setGender("male");
      setIsGuest(false);
      setPlayPreferences([]);
      setIsOpen(false);
    }
  };

  const selectMember = (member: Member) => {
    setName(member.name);
    setGender(member.gender);
    setIsGuest(member.isGuest);
    setPlayPreferences(member.playPreferences || []);
    setShowSuggestions(false);
  };

  const togglePreference = (preference: PlayPreference) => {
    if (playPreferences.includes(preference)) {
      setPlayPreferences(playPreferences.filter(p => p !== preference));
    } else {
      setPlayPreferences([...playPreferences, preference]);
    }
  };

  const filteredMembers = membersList.filter(member =>
    member.name.toLowerCase().includes(name.toLowerCase())
  );

  // Create a set of ALL session player names for the suggestion UI
  const sessionNameSet = activeSessionNames;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant={variant}>
          <Plus size={16} className="mr-2" />
          Add Player
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Player</SheetTitle>
          <SheetDescription>
            Add a new player to the queue for today's session
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <div className="relative">
              <Input 
                id="name" 
                placeholder="Enter player name" 
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(name.length > 0)}
                autoComplete="off"
              />
              
              {/* Suggestions dropdown extracted */}
              <PlayerSuggestions
                members={filteredMembers}
                queueNameSet={sessionNameSet}
                name={name}
                show={showSuggestions}
                onSelect={selectMember}
              />
            </div>
          </div>
          
          {/* Gender selector extracted */}
          <GenderRadioGroup gender={gender} setGender={setGender} />
          
          {/* Play preferences extracted */}
          {preferencesEnabled && (
            <PlayPreferencesSelector
              gender={gender}
              playPreferences={playPreferences}
              togglePreference={togglePreference}
            />
          )}
          
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors">
            <Checkbox 
              id="guest" 
              checked={isGuest}
              onCheckedChange={(checked) => setIsGuest(checked === true)}
            />
            <Label htmlFor="guest" className="cursor-pointer">Guest</Label>
          </div>
        </div>
        
        <SheetFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleAddPlayer} disabled={!name}>
            Add to Queue
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
