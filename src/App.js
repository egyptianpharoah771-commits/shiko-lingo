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
import { initPiSDK, isPiAvailable } from "./lib/initPi";

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

  const insidePi =
    isPiAvailable() || !!localStorage.getItem("pi_uid");

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

/* ====================== Auth Gate ====================== */

function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const insidePi =
    isPiAvailable() || !!localStorage.getItem("pi_uid");

  if (loading) {
    return <div style={{ padding: 40 }}>Initializing session...</div>;
  }

  if (!insidePi && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/* ====================== Subscription Guard ====================== */

function SubscriptionGuard() {
  const { isActive, loading } = useSubscriptionContext();

  if (loading) {
    return <div style={{ padding: 40 }}>Checking subscription...</div>;
  }

  if (!isActive) {
    return <Navigate to="/upgrade" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/learn" element={<LearnPage />} />

        <Route path="/coach" element={<CoachPage />} />
        <Route path="/coach/session" element={<CoachSessionPage />} />

        <Route path="/grammar" element={<GrammarLevels />} />
        <Route path="/grammar/:level" element={<GrammarUnits />} />
        <Route path="/grammar/:level/:unit" element={<GrammarUnitWrapper />} />

        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/review" element={<SavedWordsReview />} />

        <Route
          path="/vocabulary/quiz"
          element={
            <ReviewErrorBoundary>
              <ReviewWordsPage />
            </ReviewErrorBoundary>
          }
        />

        <Route path="/vocabulary/:level" element={<VocabularyLevelPage />} />
        <Route path="/vocabulary/:level/:unitId" element={<VocabularyUnitPage />} />

        <Route
          path="/review"
          element={
            <ReviewErrorBoundary>
              <ReviewWordsPage />
            </ReviewErrorBoundary>
          }
        />

        <Route path="/listening" element={<ListeningHome />} />
        <Route path="/listening/:level" element={<ListeningLevel />} />
        <Route path="/listening/:level/:lessonId" element={<Listening />} />

        <Route path="/reading" element={<ReadingHome />} />
        <Route path="/reading/:level" element={<ReadingLevel />} />
        <Route path="/reading/:level/:lessonId" element={<ReadingLesson />} />

        <Route path="/speaking" element={<SpeakingHome />} />
        <Route path="/writing" element={<Writing />} />

        <Route path="/pi" element={<AdminGuard><PI /></AdminGuard>} />
        <Route path="/admin/feedback" element={<AdminGuard><AdminFeedback /></AdminGuard>} />
      </Routes>
    </AppLayout>
  );
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

      {/* 🔥 FIX ONLY HERE */}
      <main style={{ flexGrow: 1 }}>
        <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
          {children}
        </div>
      </main>

      {!hideLayout && (
        <footer style={footerStyle}>
          <Link to="/privacy" style={footerLink}>Privacy Policy</Link>
          <span style={{ margin: "0 10px" }}>•</span>
          <Link to="/terms" style={footerLink}>Terms & Conditions</Link>
        </footer>
      )}
    </div>
  );
}

/* باقي الكود زي ما هو بدون تغيير */