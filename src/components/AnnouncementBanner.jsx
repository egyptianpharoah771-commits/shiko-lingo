import { useEffect, useMemo, useState } from "react";
import { fetchActiveAnnouncements } from "../services/announcementService";

const SEEN_KEY = "shiko_seen_announcements";

function AnnouncementBanner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      const result = await fetchActiveAnnouncements(5);

      if (!active) return;

      if (result.error) {
        setError("Could not load announcements now.");
        setItems([]);
      } else {
        setItems(result.data || []);
      }

      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const seenIds = useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const visible = useMemo(() => {
    return items.filter((item) => !seenIds.includes(item.id));
  }, [items, seenIds]);

  const latest = visible[0];

  const markSeen = () => {
    if (!latest?.id) return;
    const merged = Array.from(new Set([...seenIds, latest.id]));
    localStorage.setItem(SEEN_KEY, JSON.stringify(merged));
    setItems((prev) => prev.filter((item) => item.id !== latest.id));
  };

  if (loading) return null;

  if (error) {
    return (
      <div style={{ ...wrapStyle, borderColor: "#efc3c3", background: "#fff2f2" }}>
        <div style={{ flex: 1 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>
            Announcements unavailable
          </strong>
          <span style={{ color: "#7a2b2b", fontSize: 14 }}>{error}</span>
        </div>
      </div>
    );
  }

  if (!latest) return null;

  return (
    <div style={wrapStyle}>
      <div style={chipStyle}>
        {latest.type || "update"}
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", marginBottom: 4 }}>
          {latest.title}
        </strong>
        <span style={{ color: "#444", fontSize: 14 }}>
          {latest.body}
        </span>
        {latest.cta_url && (
          <div style={{ marginTop: 8 }}>
            <a href={latest.cta_url} target="_blank" rel="noreferrer" style={linkStyle}>
              Learn more
            </a>
          </div>
        )}
      </div>
      <button onClick={markSeen} style={closeBtnStyle} aria-label="Dismiss announcement">
        ✕
      </button>
    </div>
  );
}

const wrapStyle = {
  width: "min(720px, 100%)",
  margin: "0 auto 14px",
  background: "#fff8e7",
  border: "1px solid #f2d188",
  borderRadius: 14,
  padding: "12px 14px",
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  textAlign: "left",
};

const chipStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.8,
  color: "#7a4f01",
  background: "#ffe8b2",
  borderRadius: 999,
  padding: "4px 8px",
  fontWeight: 700,
};

const linkStyle = {
  color: "#2754c5",
  fontWeight: 600,
  textDecoration: "none",
};

const closeBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#6d6d6d",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
  padding: 2,
};

export default AnnouncementBanner;
