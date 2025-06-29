
import { useState, useEffect } from "react";

export function useWinnerSelection(isOpen: boolean) {
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedWinners([]);
    }
  }, [isOpen]);

  const toggleWinner = (playerName: string) => {
    if (selectedWinners.includes(playerName)) {
      setSelectedWinners(selectedWinners.filter((name) => name !== playerName));
    } else {
      if (selectedWinners.length < 2) {
        setSelectedWinners([...selectedWinners, playerName]);
      }
    }
  };

  const isValidSelection = selectedWinners.length === 2;

  return {
    selectedWinners,
    toggleWinner,
    isValidSelection,
  };
}
