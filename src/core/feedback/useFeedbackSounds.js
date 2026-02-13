import { useRef, useCallback } from "react";
import useSounds from "../../hooks/useSounds";

export default function useFeedbackSounds() {
  const sounds = useSounds();
  const lockedRef = useRef(false);

  const select = useCallback(() => {
    if (lockedRef.current) return;
    sounds.playSelect();
  }, [sounds]);

  const correct = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    sounds.playCorrect();
  }, [sounds]);

  const wrong = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    sounds.playWrong();
  }, [sounds]);

  const reset = useCallback(() => {
    lockedRef.current = false;
  }, []);

  return {
    select,
    correct,
    wrong,
    reset,
  };
}
