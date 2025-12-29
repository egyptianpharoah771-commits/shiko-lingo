import { useEffect, useMemo, useState } from "react";

/* ===== CONFIG ===== */
const ADMIN_PIN = "1234";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
}

function AdminFeedback() {
  /* ===== Auth ===== */
  const [pin, setPin] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  /* ===== Data ===== */
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  /* ===== Login ===== */
  const handleLogin = () => {
    const cleanPin = pin.trim();

    if (!cleanPin) {
      setError("⚠️ Enter PIN");
      return;
    }

    if (cleanPin === ADMIN_PIN) {
      setAuthorized(true);
      setError("");
    } else {
      setError("❌ Wrong PIN");
    }
  };

  /* ===== Load ===== */
  useEffect(() => {
    if (!authorized) return;

    const stored =
      JSON.parse(localStorage.getItem("userFeedback")) || [];

    const normalized = stored.map((f) => ({
      ...f,
      isRead: f.isRead ?? false,
      adminNote: f.adminNote ?? "",
    }));

    setFeedbacks(normalized.slice().reverse());
  }, [authorized]);

  /* ===== Persist ===== */
  const persist = (list) => {
    setFeedbacks(list);
    localStorage.setItem(
      "userFeedback",
      JSON.stringify(list.slice().reverse())
    );
  };

  /* ===== Filter + Search ===== */
  const filtered = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchSection =
        filter === "All" ||
        (f.section &&
          f.section.toLowerCase() === filter.toLowerCase());

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (f.message &&
          f.message.toLowerCase().includes(q)) ||
        (f.section &&
          f.section.toLowerCase().includes(q)) ||
        (f.adminNote &&
          f.adminNote.toLowerCase().includes(q));

      return matchSection && matchSearch;
    });
  }, [filter, search, feedbacks]);

  /* ===== Group by Date ===== */
  const grouped = useMemo(() => {
    return {
      today: filtered.filter((f) => isToday(f.date)),
      earlier: filtered.filter((f) => !isToday(f.date)),
    };
  }, [filtered]);

  /* ===== Actions ===== */
  const markAsRead = (idx) => {
    const updated = [...feedbacks];
    updated[idx] = { ...updated[idx], isRead: true };
    persist(updated);
  };

  const markAllAsRead = () => {
    persist(feedbacks.map((f) => ({ ...f, isRead: true })));
  };

  const updateNote = (idx, value) => {
    const updated = [...feedbacks];
    updated[idx] = { ...updated[idx], adminNote: value };
    persist(updated);
  };

  const exportTXT = () => {
    if (filtered.length === 0) return;

    const text = filtered
      .map(
        (f) =>
          `[${f.section}] – ${new Date(f.date).toLocaleString()}
Status: ${f.isRead ? "Read" : "Unread"}
Admin Note: ${f.adminNote || "-"}
--------------------------------
${f.message}`
      )
      .join("\n\n==============================\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-${filter.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!window.confirm("⚠️ Clear ALL feedback?")) return;
    localStorage.removeItem("userFeedback");
    setFeedbacks([]);
  };

  /* ===== LOGIN ===== */
  if (!authorized) {
    return (
      <div style={loginWrap}>
        <div style={loginBox}>
          <h2>🔐 Admin Access</h2>

          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={input}
          />

          {error && (
            <p style={{ color: "red", marginTop: 8 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            style={btn}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  /* ===== PANEL ===== */
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2>🛠️ Admin – User Feedback</h2>

      <div style={controls}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={select}
        >
          <option value="All">All</option>
          <option value="General">General</option>
          <option value="Listening">Listening</option>
          <option value="Reading">Reading</option>
          <option value="Speaking">Speaking</option>
          <option value="Writing">Writing</option>
          <option value="Grammar">Grammar</option>
        </select>

        <input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputSmall}
        />

        <button onClick={exportTXT} style={btn}>
          📤 Export TXT
        </button>
        <button onClick={markAllAsRead} style={btn}>
          ✓ Mark all read
        </button>
        <button
          onClick={clearAll}
          style={{ ...btn, background: "#ffe5e5" }}
        >
          🗑️ Clear
        </button>
      </div>

      {grouped.today.length > 0 && (
        <>
          <h3>📅 Today</h3>
          {grouped.today.map((f) => (
            <FeedbackCard
              key={`${f.date}-${f.message}`}
              f={f}
              onRead={() =>
                markAsRead(feedbacks.indexOf(f))
              }
              onNote={(v) =>
                updateNote(feedbacks.indexOf(f), v)
              }
            />
          ))}
        </>
      )}

      {grouped.earlier.length > 0 && (
        <>
          <h3>🗂️ Earlier</h3>
          {grouped.earlier.map((f) => (
            <FeedbackCard
              key={`${f.date}-${f.message}`}
              f={f}
              onRead={() =>
                markAsRead(feedbacks.indexOf(f))
              }
              onNote={(v) =>
                updateNote(feedbacks.indexOf(f), v)
              }
            />
          ))}
        </>
      )}

      {filtered.length === 0 && (
        <p style={{ color: "#999" }}>No feedback.</p>
      )}
    </div>
  );
}

/* ===== Card ===== */
function FeedbackCard({ f, onRead, onNote }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        ...card,
        background: f.isRead ? "#fff" : "#fff8e6",
      }}
    >
      <div style={row}>
        <strong>
          📌 {f.section}{" "}
          {!f.isRead && (
            <span style={{ color: "#d35400" }}>
              • NEW
            </span>
          )}
        </strong>
        <small>
          {new Date(f.date).toLocaleString()}
        </small>
      </div>

      <p>{f.message}</p>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 6,
        }}
      >
        {!f.isRead && (
          <button
            onClick={onRead}
            style={{ ...btn, fontSize: 12 }}
          >
            ✓ Mark as read
          </button>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{ ...btn, fontSize: 12 }}
        >
          📝 Admin note
        </button>
      </div>

      {open && (
        <textarea
          rows={3}
          placeholder="Internal admin note (not visible to users)"
          value={f.adminNote || ""}
          onChange={(e) =>
            onNote(e.target.value)
          }
          style={{
            width: "100%",
            marginTop: 8,
            padding: 8,
          }}
        />
      )}
    </div>
  );
}

/* ===== Styles ===== */
const loginWrap = {
  minHeight: "80vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const loginBox = {
  padding: 30,
  borderRadius: 12,
  background: "#fff",
  width: 320,
  textAlign: "center",
};

const controls = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20,
};

const select = { padding: 8, borderRadius: 6 };
const input = {
  width: "100%",
  padding: 8,
  marginTop: 10,
};
const inputSmall = { padding: 8, borderRadius: 6 };

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
};

export default AdminFeedback;
