import { useRef } from "react";

export default function ListenQuestion({ word, onAnswer }) {
  const audioRef = useRef(null);

  if (!word) return null;

  function playAudio() {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }

  return (
    <div>
      <audio ref={audioRef} src={word.audio_url} />

      <button onClick={playAudio}>Play</button>

      <p>{word.definition}</p>

      <button onClick={() => onAnswer(true)}>I know it</button>
      <button onClick={() => onAnswer(false)}>I don’t know</button>
    </div>
  );
}


