let correctAudio = null;
let wrongAudio = null;
let selectAudio = null;

/**
 * Safe audio loader
 */
function safeAudio(src) {
  try {
    const audio = new Audio(src);

    // 🔥 يمنع crash لو الملف مش موجود
    audio.onerror = () => {
      console.warn("Audio failed:", src);
    };

    return audio;
  } catch {
    return null;
  }
}

export function initSFX() {
  correctAudio = safeAudio("/sounds/correct.mp3");
  wrongAudio = safeAudio("/sounds/wrong.mp3");
  selectAudio = safeAudio("/sounds/select.mp3");
}

export function playSelect() {
  if (!selectAudio) return;
  try {
    selectAudio.currentTime = 0;
    selectAudio.play().catch(() => {});
  } catch {}
}

export function playCorrect() {
  if (!correctAudio) return;
  try {
    correctAudio.currentTime = 0;
    correctAudio.play().catch(() => {});
  } catch {}
}

export function playWrong() {
  if (!wrongAudio) return;
  try {
    wrongAudio.currentTime = 0;
    wrongAudio.play().catch(() => {});
  } catch {}
}