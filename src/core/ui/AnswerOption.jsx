import { useRef } from "react";

function AnswerOption({
  label,
  state = "default", // default | selected | correct | wrong
  disabled = false,
  onClick,
  className = "",
}) {
  let stateClass = "answer-option";

  if (state === "selected") stateClass += " selected";
  if (state === "correct") stateClass += " correct";
  if (state === "wrong") stateClass += " wrong";
  if (disabled) stateClass += " disabled";

  // 🔊 Select sound (safe – no state, no effect)
  const selectSoundRef = useRef(null);

  if (!selectSoundRef.current) {
    selectSoundRef.current = new Audio("/sounds/select.mp3");
  }

  const handleClick = (e) => {
    if (!disabled) {
      try {
        selectSoundRef.current.currentTime = 0;
        selectSoundRef.current.play();
      } catch (err) {
        // silent fail – never break UI
      }
    }

    onClick?.(e);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`${stateClass} ${className}`}
    >
      {label}
    </button>
  );
}

export default AnswerOption;
