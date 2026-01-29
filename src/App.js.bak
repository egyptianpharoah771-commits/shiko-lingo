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
        onClick={() => navigate("/pi")}
      >
        🔐 Continue with Pi
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

    // ❗ IMPORTANT FIX:
    // Disable storage listener while inside Grammar units
    if (!location.pathname.startsWith("/grammar/")) {
      window.addEventListener("storage", loadUnread);

      return () => {
        window.removeEventListener(
          "storage",
          loadUnread
        );
      };
    }
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!hideLayout && <FeedbackButton />}

      {!hideLayout && (
        <>
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
            <NavButton
              to="/dashboard"
              label="Dashboard"
            />
            <NavButton
              to="/level-test"
              label="Level Test"
            />
            <NavButton
              to="/placement-test"
              label="Placement Test"
            />
            <NavButton
              to="/grammar"
              label="Grammar"
            />
            <NavButton
              to="/listening"
              label="Listening"
            />
            <NavButton
              to="/reading"
              label="Reading"
            />
            <NavButton
              to="/speaking"
              label="Speaking"
            />
            <NavButton
              to="/writing"
              label="Writing"
            />
            <NavButton
              to="/upgrade"
              label="Upgrade"
            />
            <NavButton to="/pi" label="Pi" />
          </nav>
        </>
      )}

      <div style={{ padding: 20, flex: 1 }}>
        {children}
      </div>

      {!hideLayout && (
        <footer style={footerStyle}>
          <Link to="/privacy">Privacy Policy</Link>{" "}
          |{" "}
          <Link to="/terms">Terms & Conditions</Link>
        </footer>
      )}
    </div>
  );
}

/* ======================
   App
====================== */
function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Entry />} />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
            path="/level-test"
            element={<LevelTest />}
          />
          <Route
            path="/placement-test"
            element={<PlacementTest />}
          />

          {/* ===== GRAMMAR (ORDER FIXED) ===== */}
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

          <Route
            path="/writing"
            element={<Writing />}
          />
          <Route
            path="/upgrade"
            element={<Upgrade />}
          />
          <Route path="/pi" element={<PI />} />

          <Route
            path="/privacy"
            element={<Privacy />}
          />
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

/* ================= Helpers ================= */
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
};

const navStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 20,
};

const buttonStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  backgroundColor: "#e5e9ff",
  fontWeight: "bold",
};

const feedbackBadgeStyle = {
  background: "rgba(255,255,255,0.15)",
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
