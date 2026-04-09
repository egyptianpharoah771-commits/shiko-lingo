const BASE_AUDIO_URL =
  process.env.REACT_APP_AUDIO_BASE_URL ||
  "https://nsawwockspgccdlmqj.supabase.co/storage/v1/object/public/audio";

/**
 * Main audio URL builder (Supabase / CDN)
 */
export function getAudioUrl(path) {
  return `${BASE_AUDIO_URL}/${path}`;
}

/**
 * Local UI sounds (keep local for performance)
 */
export const UI_SOUNDS = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  select: "/sounds/select.mp3",
};

/**
 * Play helper
 */
export function playAudio(path) {
  const audio = new Audio(getAudioUrl(path));
  audio.play();
}

/**
 * Play UI sound
 */
export function playUISound(type) {
  const src = UI_SOUNDS[type];
  if (!src) return;

  const audio = new Audio(src);
  audio.play();
}
