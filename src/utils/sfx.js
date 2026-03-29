let correctAudio = null;
let wrongAudio = null;

export function initSFX() {
  try {
    correctAudio = new Audio("/sounds/correct.mp3");
    wrongAudio = new Audio("/sounds/wrong.mp3");
  } catch (e) {
    console.error("SFX init error:", e);
  }
}

export function playCorrect() {
  try {
    if (!correctAudio) return;
    correctAudio.currentTime = 0;
    correctAudio.play().catch(() => {});
  } catch {}
}

export function playWrong() {
  try {
    if (!wrongAudio) return;
    wrongAudio.currentTime = 0;
    wrongAudio.play().catch(() => {});
  } catch {}
}