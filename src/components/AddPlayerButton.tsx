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
import { nanoid } from "nanoid";

interface Member {
  id: string; // Changed from number to string
  name: string;
  gender: "male" | "female";
  isGuest?: boolean;
  wins?: number;
  losses?: number;
}

interface AddPlayerButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean}) => void;
}

export function AddPlayerButton({ variant = "outline", onAddPlayer }: AddPlayerButtonProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isGuest, setIsGuest] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Load members from localStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem("clubMembers");
    if (savedMembers) {
      try {
        setMembersList(JSON.parse(savedMembers));
      } catch (e) {
        console.error("Error parsing members from localStorage", e);
      }
    }
  }, [isOpen]); // Reload when sheet opens
  
  const handleAddPlayer = () => {
    if (name && onAddPlayer) {
      // Check if player already exists in members list
      const existingMember = membersList.find(
        member => member.name.toLowerCase() === name.toLowerCase()
      );
      
      // If player doesn't exist in members list, add them
      if (!existingMember) {
        // Create new member object
        const newMember: Member = {
          id: nanoid(), // Changed from Date.now() to nanoid()
          name,
          gender,
          isGuest,
          wins: 0,
          losses: 0
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
        isGuest
      });
      
      // Reset form
      setName("");
      setGender("male");
      setIsGuest(false);
      setIsOpen(false);
    }
  };

  const selectMember = (member: Member) => {
    setName(member.name);
    setGender(member.gender);
    setIsGuest(member.isGuest);
    setShowSuggestions(false);
  };

  const filteredMembers = membersList.filter(member => 
    member.name.toLowerCase().includes(name.toLowerCase())
  );
  
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
              />
              
              {showSuggestions && filteredMembers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredMembers.map(member => (
                    <div 
                      key={member.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                      onClick={() => selectMember(member)}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${member.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
                      <span className="font-medium">{member.name}</span>
                      {member.isGuest && (
                        <span className="ml-2 text-xs bg-gray-100 px-1 py-0.5 rounded">Guest</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={(value) => setGender(value as "male" | "female")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="guest" 
              checked={isGuest}
              onCheckedChange={(checked) => setIsGuest(checked === true)}
            />
            <Label htmlFor="guest">Guest</Label>
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
