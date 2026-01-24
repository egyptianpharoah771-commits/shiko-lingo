import { useRef, useEffect } from "react";

export default function useSounds() {
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  useEffect(() => {
    selectSound.current = new Audio("/sounds/select.mp3");
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, []);

  const play = (soundRef) => {
    try {
      if (!soundRef.current) return;
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      soundRef.current.play();
    } catch {
      // Pi Browser silent fail
    }
  };

  return {
    playSelect: () => play(selectSound),
    playCorrect: () => play(correctSound),
    playWrong: () => play(wrongSound),
  };
}