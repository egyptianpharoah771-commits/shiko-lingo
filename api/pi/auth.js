import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PI_API_BASE = "https://api.minepi.com/v2";

async function verifyPiAccessToken(accessToken) {
  const response = await fetch(`${PI_API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("INVALID_PI_TOKEN");
  }

  return response.json();
}

function generateInternalEmail(piUid) {
  return `${piUid}@pi.shikolingo.internal`;
}

function extractTokensFromLink(link) {
  const url = new URL(link);
  const hash = new URLSearchParams(url.hash.substring(1));
  return {
    access_token: hash.get("access_token"),
    refresh_token: hash.get("refresh_token"),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { pi_uid, accessToken } = req.body;

    if (!pi_uid || !accessToken) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // 1️⃣ Verify Pi token
    const piUser = await verifyPiAccessToken(accessToken);

    if (piUser.uid !== pi_uid) {
      return res.status(401).json({ error: "PI_UID_MISMATCH" });
    }

    const email = generateInternalEmail(pi_uid);

    // 2️⃣ Ensure user exists
    const { data: existingUsers } =
      await supabaseAdmin.auth.admin.listUsers();

    let user =
      existingUsers.users.find((u) => u.email === email);

    if (!user) {
      const { data: createdUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        });

      if (createError) {
        console.error("USER CREATION ERROR:", createError);
        return res.status(500).json({
          error: "USER_CREATION_FAILED",
        });
      }

      user = createdUser.user;
    }

    // 3️⃣ Generate magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError) {
      console.error("SESSION GENERATION ERROR:", linkError);
      return res.status(500).json({
        error: "SESSION_GENERATION_FAILED",
      });
    }

    const actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      return res.status(500).json({
        error: "INVALID_ACTION_LINK",
      });
    }

    const { access_token, refresh_token } =
      extractTokensFromLink(actionLink);

    if (!access_token || !refresh_token) {
      return res.status(500).json({
        error: "INVALID_SESSION_TOKENS",
      });
    }

    return res.status(200).json({
      access_token,
      refresh_token,
    });

  } catch (err) {
    console.error("PI AUTH ERROR:", err);
    return res.status(500).json({
      error: "SERVER_ERROR",
    });
  }
}