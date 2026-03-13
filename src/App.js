import ReviewWordsPage from "./pages/ReviewWordsPage";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "./context/SubscriptionContext";

import { initPiSDK, isPiAvailable } from "./lib/initPi";
import { migrateLegacyStorage } from "./utils/migrateStorage";

import FeedbackButton from "./components/FeedbackButton";
import AdminGuard from "./components/AdminGuard";

/* Pages */
import Dashboard from "./pages/Dashboard";
import PI from "./pages/PI";
import Writing from "./pages/Writing";
import AdminFeedback from "./pages/AdminFeedback";
import Upgrade from "./pages/Upgrade";
import AssessmentPage from "./assessment/AssessmentPage";

/* Listening */
import ListeningHome from "./pages/ListeningHome";
import ListeningLevel from "./pages/ListeningLevel";
import Listening from "./pages/Listening";

/* Reading */
import ReadingHome from "./ReadingHome";
import ReadingLevel from "./ReadingLevel";
import ReadingLesson from "./ReadingLesson";

/* Speaking */
import SpeakingHome from "./speaking/SpeakingHome";

/* Vocabulary */
import VocabularyPage from "./vocabulary/VocabularyPage";
import VocabularyLevelPage from "./vocabulary/VocabularyLevelPage";
import VocabularyUnitPage from "./vocabulary/VocabularyUnitPage";
import VocabularyQuiz from "./vocabulary/VocabularyQuiz";

/* Grammar */
import GrammarLevels from "./grammar/GrammarLevels";
import GrammarUnits from "./grammar/GrammarUnits";
import GrammarUnitPage from "./grammar/GrammarUnitPage";

/* Legal */
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";

/* ======================
   Entry Page
====================== */

function Entry() {
  const navigate = useNavigate();
  const insidePi = isPiAvailable();

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

      {!insidePi && (
        <>
          <br />
          <br />
          <button onClick={() => navigate("/login")}>🔐 Login</button>
        </>
      )}
    </div>
  );
}

/* ======================
   Auth Gate
====================== */

function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const insidePi = isPiAvailable();

  if (loading) {
    return <div style={{ padding: 40 }}>Initializing session...</div>;
  }

  if (!insidePi && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/* ======================
   Subscription Guard
====================== */

function SubscriptionGuard() {
  const { isActive, loading } = useSubscriptionContext();

  if (loading) {
    return <div style={{ padding: 40 }}>Checking subscription...</div>;
  }

  if (!isActive) {
    return <Upgrade />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Grammar */}
        <Route path="/grammar" element={<GrammarLevels />} />
        <Route path="/grammar/:level" element={<GrammarUnits />} />
        <Route path="/grammar/:level/:unit" element={<GrammarUnitPage />} />

        {/* Vocabulary */}
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/quiz" element={<VocabularyQuiz />} />
        <Route path="/vocabulary/:level" element={<VocabularyLevelPage />} />
        <Route
          path="/vocabulary/:level/:unitId"
          element={<VocabularyUnitPage />}
        />

        {/* Review */}
        <Route path="/review" element={<ReviewWordsPage />} />

        {/* Listening */}
        <Route path="/listening" element={<ListeningHome />} />
        <Route path="/listening/:level" element={<ListeningLevel />} />
        <Route path="/listening/:level/:lessonId" element={<Listening />} />

        {/* Reading */}
        <Route path="/reading" element={<ReadingHome />} />
        <Route path="/reading/:level" element={<ReadingLevel />} />
        <Route
          path="/reading/:level/:lessonId"
          element={<ReadingLesson />}
        />

        {/* Other Skills */}
        <Route path="/speaking" element={<SpeakingHome />} />
        <Route path="/writing" element={<Writing />} />

        {/* Admin */}
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
  );
}

/* ======================
   Layout
====================== */

function AppLayout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/";

  useEffect(() => {
    migrateLegacyStorage();
  }, []);

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
            <strong style={{ fontSize: 20 }}>Shiko Lingo</strong>
          </header>

          <nav style={navStyle}>
            <NavButton to="/dashboard" label="Dashboard" />
            <NavButton to="/grammar" label="Grammar" />
            <NavButton to="/vocabulary" label="Vocabulary" />
            <NavButton to="/review" label="Daily Review" />
            <NavButton to="/listening" label="Listening" />
            <NavButton to="/reading" label="Reading" />
            <NavButton to="/speaking" label="Speaking" />
            <NavButton to="/writing" label="Writing" />
          </nav>
        </>
      )}

      <div style={{ padding: 20, flex: 1 }}>{children}</div>

      {!hideLayout && (
        <footer style={footerStyle}>
          <Link to="/privacy" style={footerLink}>
            Privacy Policy
          </Link>

          <span style={{ margin: "0 10px" }}>•</span>

          <Link to="/terms" style={footerLink}>
            Terms & Conditions
          </Link>
        </footer>
      )}
    </div>
  );
}

/* ======================
   Navigation Button
====================== */

function NavButton({ to, label }) {
  return (
    <Link to={to}>
      <button style={navBtnStyle}>{label}</button>
    </Link>
  );
}

/* ======================
   Root App
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
            <Route path="/" element={<Entry />} />
            <Route path="/login" element={<Login />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            <Route
              path="/*"
              element={
                <AuthGate>
                  <SubscriptionGuard />
                </AuthGate>
              }
            />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

/* ======================
   Styles
====================== */

const headerStyle = {
  backgroundColor: "#ffffff",
  padding: 15,
  borderBottom: "1px solid #e2d7ee",
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

const footerStyle = {
  padding: 15,
  textAlign: "center",
  borderTop: "1px solid #eee",
  fontSize: 14,
  backgroundColor: "#fafafa",
};

const footerLink = {
  textDecoration: "none",
  color: "#4A2F6E",
  fontWeight: "bold",
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