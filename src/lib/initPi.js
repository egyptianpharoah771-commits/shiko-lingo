let initialized = false;

export function initPiSDK() {
  if (typeof window === "undefined") return;

  if (!window.Pi) {
    console.warn("Pi SDK not detected");
    return;
  }

  if (initialized) return;

  console.log("✅ Pi SDK detected (init only, no auth)");

  // ❗ No authenticate here
  // ❗ No incomplete payment handler here
  // ❗ No Pi API calls here

  initialized = true;
}