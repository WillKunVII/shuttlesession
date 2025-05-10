
import { useState } from "react";
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

interface AddPlayerButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  onAddPlayer?: (player: {name: string, gender: "male" | "female", isGuest: boolean}) => void;
}

export function AddPlayerButton({ variant = "outline", onAddPlayer }: AddPlayerButtonProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isGuest, setIsGuest] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAddPlayer = () => {
    if (name && onAddPlayer) {
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
            <Input 
              id="name" 
              placeholder="Enter player name" 
              value={name}
              onChange={e => setName(e.target.value)}
            />
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
