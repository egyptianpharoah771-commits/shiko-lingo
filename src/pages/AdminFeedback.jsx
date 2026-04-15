import { useEffect, useMemo, useState } from "react";
import {
  deleteAllFeedback,
  deleteFeedback,
  fetchAllFeedback,
  markAllFeedbackRead,
  markFeedbackRead,
  updateAdminNote,
} from "../services/feedbackService";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getDate()     === t.getDate()     &&
    d.getMonth()    === t.getMonth()    &&
    d.getFullYear() === t.getFullYear()
  );
}

function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [filter,    setFilter]    = useState("All");
  const [search,    setSearch]    = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const { data, error: fetchError } = await fetchAllFeedback();
    if (fetchError) {
      setError(fetchError.message || "Failed to load feedback.");
    } else {
      setFeedbacks(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await markFeedbackRead(id);
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, is_read: true } : f))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllFeedbackRead();
    setFeedbacks((prev) => prev.map((f) => ({ ...f, is_read: true })));
  };

  const handleNote = async (id, value) => {
    await updateAdminNote(id, value);
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, admin_note: value } : f))
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    await deleteFeedback(id);
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = async () => {
    if (!window.confirm("⚠️ Clear ALL feedback?")) return;
    await deleteAllFeedback();
    setFeedbacks([]);
  };

  const exportTXT = () => {
    if (filtered.length === 0) return;
    const text = filtered
      .map(
        (f) =>
          `[${f.section}] – ${new Date(f.created_at).toLocaleString()}
Status: ${f.is_read ? "Read" : "Unread"}
Admin Note: ${f.admin_note || "-"}
--------------------------------
${f.message}`
      )
      .join("\n\n==============================\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `feedback-${filter.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchSection =
        filter === "All" ||
        f.section?.toLowerCase() === filter.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        f.message?.toLowerCase().includes(q) ||
        f.section?.toLowerCase().includes(q) ||
        f.admin_note?.toLowerCase().includes(q);
      return matchSection && matchSearch;
    });
  }, [filter, search, feedbacks]);

  const grouped = useMemo(() => ({
    today:   filtered.filter((f) => isToday(f.created_at)),
    earlier: filtered.filter((f) => !isToday(f.created_at)),
  }), [filtered]);

  const unreadCount = feedbacks.filter((f) => !f.is_read).length;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2>
        🛠️ Admin – User Feedback
        {unreadCount > 0 && (
          <span style={badge}>{unreadCount} new</span>
        )}
      </h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={controls}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={select}>
          <option value="All">All</option>
          <option value="General">General</option>
          <option value="Listening">Listening</option>
          <option value="Reading">Reading</option>
          <option value="Speaking">Speaking</option>
          <option value="Writing">Writing</option>
          <option value="Grammar">Grammar</option>
          <option value="Vocabulary">Vocabulary</option>
        </select>

        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputSmall}
        />

        <button onClick={exportTXT}       style={btn}>📤 Export TXT</button>
        <button onClick={handleMarkAllRead} style={btn}>✓ Mark all read</button>
        <button onClick={load}            style={btn}>🔄 Refresh</button>
        <button onClick={handleClearAll}  style={{ ...btn, background: "#ffe5e5" }}>
          🗑️ Clear all
        </button>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && grouped.today.length > 0 && (
        <>
          <h3>📅 Today</h3>
          {grouped.today.map((f) => (
            <FeedbackCard
              key={f.id}
              f={f}
              onRead={() => handleMarkRead(f.id)}
              onNote={(v) => handleNote(f.id, v)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </>
      )}

      {!loading && grouped.earlier.length > 0 && (
        <>
          <h3>🗂️ Earlier</h3>
          {grouped.earlier.map((f) => (
            <FeedbackCard
              key={f.id}
              f={f}
              onRead={() => handleMarkRead(f.id)}
              onNote={(v) => handleNote(f.id, v)}
              onDelete={() => handleDelete(f.id)}
            />
          ))}
        </>
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ color: "#999" }}>No feedback yet.</p>
      )}
    </div>
  );
}

function FeedbackCard({ f, onRead, onNote, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ ...card, background: f.is_read ? "#fff" : "#fff8e6" }}>
      <div style={row}>
        <strong>
          📌 {f.section}{" "}
          {!f.is_read && <span style={{ color: "#d35400" }}>• NEW</span>}
        </strong>
        <small>{new Date(f.created_at).toLocaleString()}</small>
      </div>

      {f.page && (
        <small style={{ color: "#999", display: "block", marginBottom: 4 }}>
          📄 {f.page}
        </small>
      )}

      <p style={{ margin: "6px 0" }}>{f.message}</p>

      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        {!f.is_read && (
          <button onClick={onRead} style={{ ...btn, fontSize: 12 }}>
            ✓ Mark as read
          </button>
        )}
        <button onClick={() => setOpen(!open)} style={{ ...btn, fontSize: 12 }}>
          📝 Admin note
        </button>
        <button
          onClick={onDelete}
          style={{ ...btn, fontSize: 12, background: "#ffe5e5" }}
        >
          🗑️ Delete
        </button>
      </div>

      {open && (
        <textarea
          rows={3}
          placeholder="Internal admin note (not visible to users)"
          value={f.admin_note || ""}
          onChange={(e) => onNote(e.target.value)}
          style={{ width: "100%", marginTop: 8, padding: 8, boxSizing: "border-box" }}
        />
      )}
    </div>
  );
}

/* ===== Styles ===== */
const controls = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20,
};

const badge = {
  marginLeft: 10,
  fontSize: 13,
  background: "#ff6b35",
  color: "#fff",
  borderRadius: 999,
  padding: "2px 10px",
  fontWeight: 700,
};

const select     = { padding: 8, borderRadius: 6, border: "1px solid #ccc" };
const inputSmall = { padding: 8, borderRadius: 6, border: "1px solid #ccc" };

const btn = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  background: "#e5e9ff",
  fontWeight: "bold",
};

const card = {
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 8,
};

export default AdminFeedback;
