
import { PlayPreference } from "./member";

export interface Player {
  id: number;
  name: string;
  gender: "male" | "female";
  waitingTime: number;
  isGuest?: boolean;
  wins?: number;
  losses?: number;
  playPreferences?: PlayPreference[];
}
