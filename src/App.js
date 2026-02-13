import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
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
   Assessment (NEW)
====================== */
import AssessmentPage from "./assessment/AssessmentPage";

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
   Vocabulary
====================== */
import VocabularyPage from "./vocabulary/vocabularypage";
import VocabularyLevelPage from "./vocabulary/vocabularylevelpage";
import VocabularyUnitPage from "./vocabulary/vocabularyunitpage";

/* ======================
   Grammar
====================== */
import GrammarLevels from "./grammar/GrammarLevels";
import GrammarUnits from "./grammar/GrammarUnits";
import GrammarUnitPage from "./grammar/GrammarUnitPage";

/* ======================
   Legal Pages
====================== */
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

/* ======================
   Entry Page
====================== */
function Entry() {
  const navigate = useNavigate();

  return (
    <div style={entryStyle}>
      <img
        src="/shiko-logo.png"
        alt="Shiko Lingo"
        style={{ width: 120, marginBottom: 20 }}
      />

      <h1>Shiko Lingo</h1>
      <p>Learn English the smart way</p>

      <button
        style={primaryBtn}
        onClick={() => navigate("/dashboard")}
      >
        🚀 Enter App
      </button>

      <button
        style={secondaryBtn}
        onClick={() => navigate("/assessment")}
      >
        🎯 Know your level
      </button>
    </div>
  );
}

/* ======================
   Announcement Bar
====================== */
function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed =
      localStorage.getItem("announcement_dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const close = () => {
    localStorage.setItem("announcement_dismissed", "1");
    setVisible(false);
  };

  return (
    <div style={announcementStyle}>
      <span>
        🔔 Update coming soon – New content & improvements are
        on the way
      </span>
      <button onClick={close} style={announceCloseBtn}>
        ✕
      </button>
    </div>
  );
}

/* ======================
   App Layout
====================== */
function AppLayout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/";

  const isAdmin =
    sessionStorage.getItem("admin_authed") === "true";

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  useEffect(() => {
    const loadUnread = () => {
      const stored =
        JSON.parse(
          localStorage.getItem(STORAGE_KEYS.FEEDBACKS)
        ) || [];

      setUnreadCount(
        stored.filter((f) => !f.isRead).length
      );
    };

    loadUnread();
    window.addEventListener("storage", loadUnread);
    return () =>
      window.removeEventListener("storage", loadUnread);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      {!hideLayout && <FeedbackButton />}

      {!hideLayout && (
        <>
          <AnnouncementBar />

          <header style={headerStyle}>
            <div style={{ display: "flex", gap: 12 }}>
              <img
                src="/shiko-logo.png"
                alt="Shiko Lingo"
                style={{ width: 42, height: 42 }}
              />
              <strong style={{ fontSize: 20 }}>
                Shiko Lingo
              </strong>
            </div>

            <Link to="/admin/feedback">
              <div style={feedbackBadgeStyle}>
                🔔 Feedback
                {unreadCount > 0 && (
                  <span style={badgeCountStyle}>
                    {unreadCount}
                  </span>
                )}
              </div>
            </Link>
          </header>

          <nav style={navStyle}>
            <NavButton to="/dashboard" label="Dashboard" />
            <NavButton to="/grammar" label="Grammar" />
            <NavButton to="/vocabulary" label="Vocabulary" />
            <NavButton to="/listening" label="Listening" />
            <NavButton to="/reading" label="Reading" />
            <NavButton to="/speaking" label="Speaking" />
            <NavButton to="/writing" label="Writing" />
            {isAdmin && <NavButton to="/pi" label="Pi" />}
          </nav>
        </>
      )}

      <div style={{ padding: 20 }}>{children}</div>

      {!hideLayout && (
        <footer style={footerStyle}>
          <Link to="/privacy">Privacy Policy</Link> |{" "}
          <Link to="/terms">Terms & Conditions</Link>
        </footer>
      )}
    </div>
  );
}

/* ======================
   App
====================== */
import { useEffect } from "react";
import { initPiSDK } from "./lib/initPi";

function App() {

  useEffect(() => {
    initPiSDK();
  }, []);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Entry />} />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ===== LEVEL ASSESSMENT ===== */}
          <Route
            path="/assessment"
            element={<AssessmentPage />}
          />

          {/* ===== GRAMMAR ===== */}
          <Route
            path="/grammar/:level/:unit"
            element={<GrammarUnitPage />}
          />
          <Route
            path="/grammar/:level"
            element={<GrammarUnits />}
          />
          <Route
            path="/grammar"
            element={<GrammarLevels />}
          />

          {/* ===== VOCABULARY ===== */}
          <Route
            path="/vocabulary/:level/:unitId"
            element={<VocabularyUnitPage />}
          />
          <Route
            path="/vocabulary/:level"
            element={<VocabularyLevelPage />}
          />
          <Route
            path="/vocabulary"
            element={<VocabularyPage />}
          />

          {/* ===== LISTENING ===== */}
          <Route
            path="/listening"
            element={<ListeningHome />}
          />
          <Route
            path="/listening/:level"
            element={<ListeningLevel />}
          />
          <Route
            path="/listening/:level/:lessonId"
            element={<Listening />}
          />

          {/* ===== READING ===== */}
          <Route
            path="/reading"
            element={<ReadingHome />}
          />
          <Route
            path="/reading/:level"
            element={<ReadingLevel />}
          />
          <Route
            path="/reading/:level/:lessonId"
            element={<ReadingLesson />}
          />

          {/* ===== SPEAKING ===== */}
          <Route
            path="/speaking"
            element={<SpeakingHome />}
          />
          <Route
            path="/speaking/B1/:lessonId"
            element={<SpeakingLessonB1 />}
          />
          <Route
            path="/speaking/:level/:lessonId"
            element={<SpeakingLesson />}
          />
          <Route
            path="/speaking/:level"
            element={<SpeakingLevel />}
          />

          <Route path="/writing" element={<Writing />} />

          {/* ===== PI (ADMIN ONLY) ===== */}
          <Route
            path="/pi"
            element={
              <AdminGuard>
                <PI />
              </AdminGuard>
            }
          />

          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          <Route
            path="/admin/feedback"
            element={
              <AdminGuard>
                <AdminFeedback />
              </AdminGuard>
            }
          />
        </Routes>
      </AppLayout>
    </Router>
  );
}


/* ======================
   Helpers
====================== */
function NavButton({ to, label }) {
  return (
    <Link to={to}>
      <button style={navBtnStyle}>{label}</button>
    </Link>
  );
}

/* ======================
   Styles
====================== */
const announcementStyle = {
  background: "#f3eef8",
  borderBottom: "1px solid #4a2f6e",
  color: "#4a2f6e",
  padding: "8px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "0.9rem",
};

const announceCloseBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 16,
  color: "#4a2f6e",
};

const headerStyle = {
  backgroundColor: "#ffffff",
  padding: 15,
  borderBottom: "1px solid #e2d7ee",
  display: "flex",
  justifyContent: "space-between",
};

const navStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20,
};

const navBtnStyle = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #e2d7ee",
  cursor: "pointer",
  backgroundColor: "#faf7fc",
  fontWeight: "bold",
};

const feedbackBadgeStyle = {
  background: "rgba(74,47,110,0.08)",
  padding: "6px 12px",
  borderRadius: 20,
  fontWeight: "bold",
};

const badgeCountStyle = {
  background: "#ff3b3b",
  borderRadius: 12,
  padding: "2px 8px",
  fontSize: 12,
};

const footerStyle = {
  textAlign: "center",
  padding: 20,
  fontSize: 14,
  opacity: 0.7,
};

const entryStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
};

const primaryBtn = {
  padding: "12px 24px",
  marginTop: 20,
  fontSize: 16,
  fontWeight: "bold",
};

const secondaryBtn = {
  padding: "10px 20px",
  marginTop: 10,
};

export default App;
