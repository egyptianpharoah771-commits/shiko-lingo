import { useEffect, useState } from "react";
import {
  createAnnouncement,
  deleteAnnouncement,
  fetchAllAnnouncements,
  updateAnnouncement,
} from "../services/announcementService";

const initialForm = {
  title: "",
  body: "",
  type: "update",
  cta_url: "",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

const templates = [
  {
    id: "welcome-en",
    label: "Welcome (EN)",
    value: {
      title: "Welcome to the new Shiko Lingo update!",
      body: "We improved lesson flow and fixed key bugs. Thank you for your support and feedback.",
      type: "update",
      cta_url: "",
      is_active: true,
      starts_at: "",
      ends_at: "",
    },
  },
  {
    id: "reward-en",
    label: "Reward (EN)",
    value: {
      title: "🎁 Reward Announcement",
      body: "Top active learners this week will receive a special in-app reward. Keep learning daily!",
      type: "reward",
      cta_url: "",
      is_active: true,
      starts_at: "",
      ends_at: "",
    },
  },
  {
    id: "welcome-ar",
    label: "ترحيب (AR)",
    value: {
      title: "🎉 أهلا بكم في تحديث Shiko Lingo",
      body: "أضفنا تحسينات جديدة في تجربة التعلم وتم إصلاح بعض المشاكل. شكرا لدعمكم المستمر.",
      type: "update",
      cta_url: "",
      is_active: true,
      starts_at: "",
      ends_at: "",
    },
  },
  {
    id: "reward-ar",
    label: "جائزة (AR)",
    value: {
      title: "🏆 إعلان جائزة جديدة",
      body: "المتعلمون الأكثر نشاطا هذا الأسبوع سيحصلون على مكافأة مميزة داخل التطبيق.",
      type: "reward",
      cta_url: "",
      is_active: true,
      starts_at: "",
      ends_at: "",
    },
  },
];

function toIsoOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [missingTable, setMissingTable] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const result = await fetchAllAnnouncements();

    if (result.missingTable) {
      setMissingTable(true);
      setItems([]);
      setLoading(false);
      return;
    }

    if (result.error) {
      setError(result.error.message || "Failed to load announcements.");
      setItems([]);
    } else {
      setItems(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      type: form.type,
      cta_url: form.cta_url.trim() || null,
      is_active: form.is_active,
      starts_at: toIsoOrNull(form.starts_at),
      ends_at: toIsoOrNull(form.ends_at),
    };

    const { error: createError } = await createAnnouncement(payload);
    setSaving(false);

    if (createError) {
      setError(createError.message || "Failed to publish announcement.");
      return;
    }

    setForm(initialForm);
    setMessage("Announcement published.");
    load();
  };

  const toggleActive = async (item) => {
    const { error: updateError } = await updateAnnouncement(item.id, {
      is_active: !item.is_active,
    });
    if (updateError) {
      setError(updateError.message || "Could not update announcement.");
      return;
    }
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    const { error: deleteError } = await deleteAnnouncement(id);
    if (deleteError) {
      setError(deleteError.message || "Could not delete announcement.");
      return;
    }
    load();
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <h2>📢 Admin - Announcements</h2>
      <p style={{ color: "#666", marginTop: 6 }}>
        Publish one message for all users on the entry screen.
      </p>

      {missingTable && (
        <div style={warnCard}>
          <strong>Missing table:</strong> create <code>announcements</code> in Supabase first.
          <p style={{ margin: "8px 0 0" }}>
            Use the SQL file at <code>supabase/announcements.sql</code>.
          </p>
        </div>
      )}

      <form onSubmit={handleCreate} style={formCard}>
        <div style={templateWrapStyle}>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              style={templateBtn}
              onClick={() => setForm({ ...tpl.value })}
              disabled={missingTable}
            >
              {tpl.label}
            </button>
          ))}
        </div>
        <input
          placeholder="Title (required)"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          style={input}
          disabled={missingTable}
        />
        <textarea
          placeholder="Body (required)"
          rows={4}
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          style={{ ...input, resize: "vertical" }}
          disabled={missingTable}
        />
        <div style={row}>
          <select
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
            style={input}
            disabled={missingTable}
          >
            <option value="update">update</option>
            <option value="notice">notice</option>
            <option value="reward">reward</option>
            <option value="event">event</option>
          </select>
          <input
            placeholder="Optional link (https://...)"
            value={form.cta_url}
            onChange={(e) => setForm((p) => ({ ...p, cta_url: e.target.value }))}
            style={input}
            disabled={missingTable}
          />
        </div>
        <div style={row}>
          <label style={label}>
            Starts at
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
              style={input}
              disabled={missingTable}
            />
          </label>
          <label style={label}>
            Ends at
            <input
              type="datetime-local"
              value={form.ends_at}
              onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
              style={input}
              disabled={missingTable}
            />
          </label>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            disabled={missingTable}
          />
          Active now
        </label>
        <button type="submit" style={btn} disabled={saving || missingTable}>
          {saving ? "Publishing..." : "Publish announcement"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h3 style={{ marginTop: 24 }}>Recent announcements</h3>
      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p style={{ color: "#777" }}>No announcements yet.</p>}

      {!loading &&
        items.map((item) => (
          <div key={item.id} style={itemCard}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <strong>{item.title}</strong>
                <p style={{ margin: "6px 0 0", whiteSpace: "pre-wrap" }}>{item.body}</p>
                <small style={{ color: "#666" }}>
                  {item.type} • {item.is_active ? "active" : "inactive"}
                </small>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <button style={smallBtn} onClick={() => toggleActive(item)}>
                  {item.is_active ? "Deactivate" : "Activate"}
                </button>
                <button style={{ ...smallBtn, background: "#ffe8e8" }} onClick={() => remove(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

const formCard = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 14,
  display: "grid",
  gap: 10,
  background: "#fff",
};

const warnCard = {
  border: "1px solid #f2d188",
  background: "#fff8e7",
  borderRadius: 10,
  padding: 12,
  marginBottom: 14,
};

const input = {
  width: "100%",
  padding: "9px 10px",
  border: "1px solid #d9d9d9",
  borderRadius: 8,
  boxSizing: "border-box",
};

const row = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const label = {
  display: "grid",
  gap: 6,
  fontSize: 13,
  color: "#555",
};

const btn = {
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  background: "#283b7a",
  color: "#fff",
  fontWeight: 700,
};

const itemCard = {
  border: "1px solid #eee",
  borderRadius: 10,
  padding: 12,
  marginBottom: 10,
  background: "#fff",
};

const smallBtn = {
  border: "none",
  borderRadius: 8,
  padding: "8px 10px",
  cursor: "pointer",
  background: "#e9efff",
  fontWeight: 600,
};

const templateWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const templateBtn = {
  border: "1px solid #dbe2ff",
  borderRadius: 999,
  padding: "6px 10px",
  background: "#f5f7ff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

export default AdminAnnouncements;
