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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { pi_uid, accessToken } = req.body;

    if (!pi_uid || !accessToken) {
      return res.status(400).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    // 1️⃣ Verify Pi token with Pi servers
    const piUser = await verifyPiAccessToken(accessToken);

    if (piUser.uid !== pi_uid) {
      return res.status(401).json({ error: "PI_UID_MISMATCH" });
    }

    const email = generateInternalEmail(pi_uid);

    // 2️⃣ Check if user exists
    const { data: existingUsers } =
      await supabaseAdmin.auth.admin.listUsers();

    let user =
      existingUsers.users.find((u) => u.email === email);

    // 3️⃣ Create user if not exists
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

    // 4️⃣ Generate session (NO PASSWORD)
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

    const { access_token, refresh_token } =
      linkData.properties;

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