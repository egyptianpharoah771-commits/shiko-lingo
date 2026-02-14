import { useRef, useEffect } from "react";

export default function useSounds() {
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  useEffect(() => {
    const base = process.env.PUBLIC_URL || "";

    selectSound.current = new Audio(`${base}/sounds/select.mp3`);
    correctSound.current = new Audio(`${base}/sounds/correct.mp3`);
    wrongSound.current = new Audio(`${base}/sounds/wrong.mp3`);

    // Preload explicitly
    selectSound.current.preload = "auto";
    correctSound.current.preload = "auto";
    wrongSound.current.preload = "auto";
  }, []);

  const play = async (soundRef) => {
    try {
      if (!soundRef.current) return;

      soundRef.current.pause();
      soundRef.current.currentTime = 0;

      const playPromise = soundRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.warn("Audio playback blocked or failed:", err);
    }
  };

  return {
    playSelect: () => play(selectSound),
    playCorrect: () => play(correctSound),
    playWrong: () => play(wrongSound),
  };
}
