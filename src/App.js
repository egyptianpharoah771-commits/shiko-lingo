import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { useSubscription } from "./hooks/useSubscription";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import { initPiSDK } from "./lib/initPi";

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
import AssessmentPage from "./assessment/AssessmentPage";
import ListeningHome from "./pages/ListeningHome";
import ReadingHome from "./reading/ReadingHome";
import SpeakingHome from "./speaking/SpeakingHome";
import VocabularyPage from "./vocabulary/vocabularypage";
import GrammarLevels from "./grammar/GrammarLevels";
import GrammarUnits from "./grammar/GrammarUnits";
import GrammarUnitPage from "./grammar/GrammarUnitPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";

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

      <button style={primaryBtn} onClick={() => navigate("/dashboard")}>
        🚀 Enter App
      </button>

      <button style={secondaryBtn} onClick={() => navigate("/assessment")}>
        🎯 Know your level
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/login")}>🔐 Login</button>
    </div>
  );
}

/* ======================
   Subscription Guard
====================== */
function SubscriptionGuard({ children }) {
  const location = useLocation();
  const { isActive, loading } = useSubscription();

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking subscription...
      </div>
    );
  }

  if (!isActive) {
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }

  return children;
}

/* ======================
   App Layout
====================== */
function AppLayout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/";
  const isAdmin = sessionStorage.getItem("admin_authed") === "true";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    migrateLegacyStorage();
  }, []);

  useEffect(() => {
    const loadUnread = () => {
      const stored =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.FEEDBACKS)) || [];
      setUnreadCount(stored.filter((f) => !f.isRead).length);
    };

    loadUnread();
    window.addEventListener("storage", loadUnread);
    return () => window.removeEventListener("storage", loadUnread);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      {!hideLayout && <FeedbackButton />}

      {!hideLayout && (
        <>
          <header style={headerStyle}>
            <div style={{ display: "flex", gap: 12 }}>
              <img
                src="/shiko-logo.png"
                alt="Shiko Lingo"
                style={{ width: 42 }}
              />
              <strong style={{ fontSize: 20 }}>Shiko Lingo</strong>
            </div>

            <Link to="/admin/feedback">
              <div style={feedbackBadgeStyle}>
                🔔 Feedback
                {unreadCount > 0 && (
                  <span style={badgeCountStyle}>{unreadCount}</span>
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
    </div>
  );
}

/* ======================
   App
====================== */
function App() {
  useEffect(() => {
    initPiSDK();
  }, []);

  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Entry />} />
            <Route path="/login" element={<Login />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected */}
            <Route
              path="/*"
              element={
                <SubscriptionGuard>
                  <AppLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />

                      {/* Grammar Routes */}
                      <Route path="/grammar" element={<GrammarLevels />} />
                      <Route
                        path="/grammar/:level"
                        element={<GrammarUnits />}
                      />
                      <Route
                        path="/grammar/:level/:unit"
                        element={<GrammarUnitPage />}
                      />

                      <Route path="/vocabulary" element={<VocabularyPage />} />
                      <Route path="/listening" element={<ListeningHome />} />
                      <Route path="/reading" element={<ReadingHome />} />
                      <Route path="/speaking" element={<SpeakingHome />} />
                      <Route path="/writing" element={<Writing />} />

                      <Route
                        path="/pi"
                        element={
                          <AdminGuard>
                            <PI />
                          </AdminGuard>
                        }
                      />

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
                </SubscriptionGuard>
              }
            />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
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