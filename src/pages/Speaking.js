import React from "react";

export default function Speaking() {
  return (
    <div className="page-container">
      <h1>Speaking Exercise (Demo)</h1>
      <p>Repeat after the audio:</p>
      <audio controls>
        <source src="/sounds/correct.mp3" type="audio/mp3" />
      </audio>
      <p>Example: "Good morning! How are you today?"</p>
      <button onClick={() => alert("Recording feature placeholder")}>
        Start Recording
      </button>
    </div>
  );
}
