import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";

/* ======================
   Utils
====================== */
import STORAGE_KEYS from "./utils/storageKeys";
import { migrateLegacyStorage } from "./utils/migrateStorage";

/* ======================
   Global Components
====================== */
import FeedbackButton from "./components/FeedbackButton";
import AdminGuard from "./components/AdminGuard";

/* ======================
   Pages
====================== */
import Dashboard from "./pages/Dashboard";
import PI from "./pages/PI";
import Writing from "./pages/Writing";
import AdminFeedback from "./pages/AdminFeedback";
import Upgrade from "./pages/Upgrade";

/* ======================
   Listening
====================== */
import ListeningHome from "./pages/ListeningHome";
import ListeningLevel from "./pages/ListeningLevel";
import Listening from "./pages/Listening";

/* ======================
   Reading
====================== */
import ReadingHome from "./reading/ReadingHome";
import ReadingLevel from "./reading/ReadingLevel";
import ReadingLesson from "./reading/ReadingLesson";

/* ======================
   Speaking
====================== */
import SpeakingHome from "./speaking/SpeakingHome";
import SpeakingLevel from "./speaking/SpeakingLevel";
import SpeakingLesson from "./speaking/SpeakingLesson";
import SpeakingLessonB1 from "./speaking/SpeakingLessonB1";

/* ======================
   Tests
====================== */
import LevelTest from "./skills/LevelTest";
import PlacementTest from "./skills/PlacementTest";

/* ======================
   Grammar
====================== */
import GrammarLevels from "./grammar/GrammarLevels";
import GrammarUnits from "./grammar/GrammarUnits";
import GrammarUnitPage from "./grammar/GrammarUnitPage";

function App() {
  /* ===== Admin unread feedback ===== */
  const [unreadCount, setUnreadCount] = useState(0);

  /* ======================
     🔑 Pi SDK INIT (PRODUCTION)
     ❌ NO SANDBOX
     ✅ Pi Browser ONLY
  ====================== */
  useEffect(() => {
    if (window.Pi && !window.__PI_INITIALIZED__) {
      window.Pi.init({
        version: "2.0",
      });

      window.__PI_INITIALIZED__ = true;
      console.log("✅ Pi SDK initialized (Production mode)");
    } else if (!window.Pi) {
      console.warn(
        "⚠️ Pi SDK not found. Please open the app in Pi Browser."
      );
    }
  }, []);

  /* ===== One-time legacy storage migration ===== */
  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  /* ===== Load unread feedback count ===== */
  useEffect(() => {
    const loadUnread = () => {
      const stored =
        JSON.parse(
          localStorage.getItem(STORAGE_KEYS.FEEDBACKS)
        ) || [];

      const unread = stored.filter(
        (f) => !f.isRead
      ).length;

      setUnreadCount(unread);
    };

    loadUnread();
    window.addEventListener("storage", loadUnread);

    return () =>
      window.removeEventListener(
        "storage",
        loadUnread
      );
  }, []);

  return (
    <Router>
      {/* 🌍 Global Floating Feedback */}
      <FeedbackButton />

      <div
        style={{
          padding: 20,
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* ================= Header ================= */}
        <header style={headerStyle}>
          <strong style={{ fontSize: 20 }}>
            🌐 Shiko Lingo
          </strong>

          <div style={{ display: "flex", gap: 10 }}>
            {/* 🔔 Admin Feedback */}
            <Link
              to="/admin/feedback"
              style={{ textDecoration: "none" }}
            >
              <div style={feedbackBadgeStyle}>
                🔔 Feedback
                {unreadCount > 0 && (
                  <span style={badgeCountStyle}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* ================= Navigation ================= */}
        <nav style={navStyle}>
          <NavButton to="/dashboard" label="Dashboard" />
          <NavButton to="/level-test" label="Level Test" />
          <NavButton
            to="/placement-test"
            label="Placement Test"
          />
          <NavButton to="/grammar" label="Grammar" />
          <NavButton to="/listening" label="Listening" />
          <NavButton to="/reading" label="Reading" />
          <NavButton to="/speaking" label="Speaking" />
          <NavButton to="/writing" label="Writing" />
          <NavButton to="/upgrade" label="Upgrade" />
          <NavButton to="/pi" label="Pi" />
        </nav>

        {/* ================= Routes ================= */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/level-test" element={<LevelTest />} />
          <Route
            path="/placement-test"
            element={<PlacementTest />}
          />

          <Route path="/grammar" element={<GrammarLevels />} />
          <Route
            path="/grammar/:level"
            element={<GrammarUnits />}
          />
          <Route
            path="/grammar/:level/:unit"
            element={<GrammarUnitPage />}
          />

          <Route path="/listening" element={<ListeningHome />} />
          <Route
            path="/listening/:level"
            element={<ListeningLevel />}
          />
          <Route
            path="/listening/:level/:lessonId"
            element={<Listening />}
          />

          <Route path="/reading" element={<ReadingHome />} />
          <Route
            path="/reading/:level"
            element={<ReadingLevel />}
          />
          <Route
            path="/reading/:level/:lessonId"
            element={<ReadingLesson />}
          />

          <Route path="/speaking" element={<SpeakingHome />} />
          <Route
            path="/speaking/B1/:lessonId"
            element={<SpeakingLessonB1 />}
          />
          <Route
            path="/speaking/:level"
            element={<SpeakingLevel />}
          />
          <Route
            path="/speaking/:level/:lessonId"
            element={<SpeakingLesson />}
          />

          <Route path="/writing" element={<Writing />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/pi" element={<PI />} />

          <Route
            path="/admin/feedback"
            element={
              <AdminGuard>
                <AdminFeedback />
              </AdminGuard>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

/* ================= Nav Button ================= */
function NavButton({ to, label }) {
  return (
    <Link to={to}>
      <button style={buttonStyle}>{label}</button>
    </Link>
  );
}

/* ================= Styles ================= */
const headerStyle = {
  backgroundColor: "#4A90E2",
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
};

const navStyle = {
  marginBottom: 20,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const buttonStyle = {
  padding: "8px 12px",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  backgroundColor: "#e5e9ff",
  fontWeight: "bold",
};

const feedbackBadgeStyle = {
  background: "rgba(255,255,255,0.15)",
  padding: "6px 12px",
  borderRadius: 20,
  color: "white",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const badgeCountStyle = {
  background: "#ff3b3b",
  borderRadius: 12,
  padding: "2px 8px",
  fontSize: 12,
};

export default App;
