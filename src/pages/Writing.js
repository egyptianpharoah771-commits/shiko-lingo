import React, { useState } from "react";

export default function Writing() {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    alert(`You wrote: ${text}`);
    setText("");
  };

  return (
    <div className="page-container">
      <h1>Writing Exercise (Demo)</h1>
      <p>Write a sentence about yourself:</p>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
      />
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
