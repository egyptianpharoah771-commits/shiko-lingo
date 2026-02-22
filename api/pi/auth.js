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

    // 1️⃣ Verify Pi token with Pi server
    const piUser = await verifyPiAccessToken(accessToken);

    if (piUser.uid !== pi_uid) {
      return res.status(401).json({ error: "PI_UID_MISMATCH" });
    }

    // 2️⃣ Check if profile exists
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("pi_uid", pi_uid)
      .maybeSingle();

    let userId;
    const email = generateInternalEmail(pi_uid);

    if (profile) {
      userId = profile.id;
    } else {
      // 3️⃣ Create new Supabase user (confirmed)
      const { data: createdUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        });

      if (createError) {
        console.error("CREATE USER ERROR:", createError);
        return res.status(500).json({ error: "USER_CREATION_FAILED" });
      }

      userId = createdUser.user.id;

      // 4️⃣ Create profile mapping
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          pi_uid,
        });

      if (profileError) {
        console.error("PROFILE INSERT ERROR:", profileError);
        return res.status(500).json({ error: "PROFILE_CREATION_FAILED" });
      }
    }

    // 5️⃣ Generate Supabase session via admin link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    if (linkError) {
      console.error("GENERATE LINK ERROR:", linkError);
      return res.status(500).json({ error: "SESSION_GENERATION_FAILED" });
    }

    const { access_token, refresh_token } = linkData.properties;

    return res.status(200).json({
      access_token,
      refresh_token,
    });

  } catch (err) {
    console.error("PI AUTH ERROR:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}