
import { PlayPreference } from "./member";

export interface Player {
  id: number; // Unique identifier
  name: string;
  gender: "male" | "female";
  waitingTime: number;
  isGuest?: boolean;
  wins?: number;
  losses?: number;
  sessionWins?: number;
  sessionLosses?: number;
  playPreferences?: PlayPreference[];
  rating?: number; // HIDDEN ELO
  isResting?: boolean; // Player is taking a break
}
