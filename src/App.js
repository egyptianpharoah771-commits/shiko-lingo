import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import { initSFX } from "./utils/sfx";

/* Pages */
import Dashboard from "./pages/Dashboard";
import PI from "./pages/PI";
import Writing from "./pages/Writing";
import AdminFeedback from "./pages/AdminFeedback";
import Upgrade from "./pages/Upgrade";
import AssessmentPage from "./assessment/AssessmentPage";
import LearnPage from "./pages/LearnPage";
import Login from "./pages/Login";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

/* 🔥 Coach */
import CoachPage from "./pages/CoachPage";
import CoachSessionPage from "./pages/CoachSessionPage";

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
import SavedWordsReview from "./vocabulary/SavedWordsReview";

/* Review */
import ReviewWordsPage from "./pages/ReviewWordsPage";

/* Grammar */
import GrammarLevels from "./grammar/GrammarLevels";
import GrammarUnits from "./grammar/GrammarUnits";
import GrammarUnitPage from "./grammar/GrammarUnitPage";

/* Context */
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  SubscriptionProvider,
  useSubscriptionContext,
} from "./context/SubscriptionContext";

/* Utils */
import { isInsidePiProductFlow } from "./lib/initPi";

/* Components */
import FeedbackButton from "./components/FeedbackButton";
import AdminGuard from "./components/AdminGuard";
import ReviewErrorBoundary from "./components/ReviewErrorBoundary";

/* ====================== 🔥 HARD FIX ====================== */

function GrammarUnitWrapper() {
  const { level, unit } = useParams();
  const location = useLocation();

  return (
    <GrammarUnitPage key={`${level}-${unit}-${location.key}`} />
  );
}

/* ====================== Entry ====================== */

function Entry() {
  const navigate = useNavigate();

  const insidePi = isInsidePiProductFlow();

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

/* ====================== Auth + subscription + layout (flat routes — reliable in RR7) ====================== */

function Guard({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { isActive, loading: subLoading } = useSubscriptionContext();

  const insidePi = isInsidePiProductFlow();

  if (loading || subLoading) {
    return (
      <div
        style={{
          padding: 40,
          color: "#212529",
          background: "#f8f9fb",
          minHeight: "40vh",
        }}
      >
        {loading ? "Initializing session..." : "Checking subscription..."}
      </div>
    );
  }

  if (!insidePi && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isActive) {
    return <Navigate to="/upgrade" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

/* ====================== Layout ====================== */

function AppLayout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideLayout && <FeedbackButton />}

      {!hideLayout && (
        <>
          <header style={headerStyle}>
            <strong style={{ fontSize: 20 }}>Shiko Lingo</strong>
          </header>

          <nav className="navbar">
            <NavButton to="/dashboard" label="🏠 Home" />
            <NavButton to="/learn" label="📚 Learn" />
            <NavButton to="/review" label="🔁 Review" />
            <NavButton to="/coach" label="🧠 Coach" />
            <NavButton to="/listening" label="🎧 Practice" />
            <NavButton to="/speaking" label="👤 Profile" />
          </nav>
        </>
      )}

      <main style={{ flex: 1 }}>
  <div
    style={{
      width: "100%",
      maxWidth: 1100,
      margin: "0 auto",
      padding: "24px 20px",
    }}
  >
    {children}
  </div>
</main>
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

function NavButton({ to, label }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);

  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <button className={`nav-btn ${active ? "active" : ""}`}>
        {label}
      </button>
    </Link>
  );
}

/* ====================== App ====================== */

function App() {
  useEffect(() => {
    initSFX();
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
            <Route path="/upgrade" element={<Upgrade />} />

            <Route
              path="/dashboard"
              element={
                <Guard>
                  <Dashboard />
                </Guard>
              }
            />
            <Route
              path="/learn"
              element={
                <Guard>
                  <LearnPage />
                </Guard>
              }
            />

            <Route
              path="/coach"
              element={
                <Guard>
                  <CoachPage />
                </Guard>
              }
            />
            <Route
              path="/coach/session"
              element={
                <Guard>
                  <Navigate to="/coach/session/A1" replace />
                </Guard>
              }
            />
            <Route
              path="/coach/session/:level"
              element={
                <Guard>
                  <CoachSessionPage />
                </Guard>
              }
            />

            <Route
              path="/grammar"
              element={
                <Guard>
                  <GrammarLevels />
                </Guard>
              }
            />
            <Route
              path="/grammar/:level"
              element={
                <Guard>
                  <GrammarUnits />
                </Guard>
              }
            />
            <Route
              path="/grammar/:level/:unit"
              element={
                <Guard>
                  <GrammarUnitWrapper />
                </Guard>
              }
            />

            <Route
              path="/vocabulary"
              element={
                <Guard>
                  <VocabularyPage />
                </Guard>
              }
            />
            <Route
              path="/vocabulary/review"
              element={
                <Guard>
                  <SavedWordsReview />
                </Guard>
              }
            />
            <Route
              path="/vocabulary/quiz"
              element={
                <Guard>
                  <ReviewErrorBoundary>
                    <ReviewWordsPage />
                  </ReviewErrorBoundary>
                </Guard>
              }
            />
            <Route
              path="/vocabulary/:level"
              element={
                <Guard>
                  <VocabularyLevelPage />
                </Guard>
              }
            />
            <Route
              path="/vocabulary/:level/:unitId"
              element={
                <Guard>
                  <VocabularyUnitPage />
                </Guard>
              }
            />

            <Route
              path="/review"
              element={
                <Guard>
                  <ReviewErrorBoundary>
                    <ReviewWordsPage />
                  </ReviewErrorBoundary>
                </Guard>
              }
            />

            <Route
              path="/listening"
              element={
                <Guard>
                  <ListeningHome />
                </Guard>
              }
            />
            <Route
              path="/listening/:level"
              element={
                <Guard>
                  <ListeningLevel />
                </Guard>
              }
            />
            <Route
              path="/listening/:level/:lessonId"
              element={
                <Guard>
                  <Listening />
                </Guard>
              }
            />

            <Route
              path="/reading"
              element={
                <Guard>
                  <ReadingHome />
                </Guard>
              }
            />
            <Route
              path="/reading/:level"
              element={
                <Guard>
                  <ReadingLevel />
                </Guard>
              }
            />
            <Route
              path="/reading/:level/:lessonId"
              element={
                <Guard>
                  <ReadingLesson />
                </Guard>
              }
            />

            <Route
              path="/speaking"
              element={
                <Guard>
                  <SpeakingHome />
                </Guard>
              }
            />
            <Route
              path="/writing"
              element={
                <Guard>
                  <Writing />
                </Guard>
              }
            />

            <Route
              path="/pi"
              element={
                <Guard>
                  <AdminGuard>
                    <PI />
                  </AdminGuard>
                </Guard>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <Guard>
                  <AdminGuard>
                    <AdminFeedback />
                  </AdminGuard>
                </Guard>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

/* ====================== Styles ====================== */

const headerStyle = {
  backgroundColor: "#ffffff",
  padding: 15,
  borderBottom: "1px solid #e2d7ee",
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
  color: "#212529",
  background: "#f8f9fb",
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