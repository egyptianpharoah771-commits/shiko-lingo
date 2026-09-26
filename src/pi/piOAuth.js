import {
  PI_OAUTH_CLIENT_ID,
  getPiOAuthRedirectUri,
} from "./oauthClientId";

const STATE_KEY = "pi_oauth_state";

export function hasPiOAuthClientId() {
  return Boolean(PI_OAUTH_CLIENT_ID);
}

export function startPiOAuthSignIn() {
  if (!PI_OAUTH_CLIENT_ID) {
    throw new Error("Pi OAuth client id is not set yet.");
  }

  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);

  const redirectUri = getPiOAuthRedirectUri();
  const scopes = ["username"];

  if (typeof window.Pi?.signIn === "function") {
    window.Pi.signIn({
      clientId: PI_OAUTH_CLIENT_ID,
      redirectUri,
      scopes,
      state,
    });
    return;
  }

  const url = new URL("https://accounts.pinet.com/oauth/authorize");
  url.searchParams.set("response_type", "token");
  url.searchParams.set("client_id", PI_OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes.join(" "));
  url.searchParams.set("state", state);
  window.location.assign(url.toString());
}

export function readPiOAuthCallback() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const expectedState = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);

  const state = params.get("state");
  if (!expectedState || state !== expectedState) {
    throw new Error("Pi sign-in state mismatch. Try again.");
  }

  const error = params.get("error");
  if (error) {
    throw new Error(`Pi sign-in failed: ${error}`);
  }

  const accessToken = params.get("access_token");
  if (!accessToken) {
    throw new Error("Pi sign-in returned no access token.");
  }

  return accessToken;
}
