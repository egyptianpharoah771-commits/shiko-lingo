import React from "react";

export default function Reading() {
  return (
    <div className="page-container">
      <h1>Reading Lesson (Demo)</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a sample paragraph for reading practice.
      </p>
      <button onClick={() => alert("Next paragraph placeholder")}>Next</button>
    </div>
  );
}
