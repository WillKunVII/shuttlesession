
export type PlayPreference = "Open" | "Mixed" | "Ladies" | "";

export type Member = {
  id: number;
  name: string;
  gender: "male" | "female";
  isGuest: boolean;
  wins: number;
  losses: number;
  playPreferences?: PlayPreference[];
  rating?: number; // HIDDEN ELO
};
