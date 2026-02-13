let initialized = false;

export function initPiSDK() {
  if (!window.Pi) {
    console.error("Pi SDK not loaded");
    return;
  }

  if (initialized) return;

  window.Pi.init({
    version: "2.0",
    sandbox: false,
  });

  initialized = true;
  console.log("Pi SDK initialized (production)");
}
