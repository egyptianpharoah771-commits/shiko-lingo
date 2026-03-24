import { Navigate } from "react-router-dom";
import { useSubscription } from "../hooks/useSubscription";

export default function ProtectedRoute({ children }) {
  const { isSubscribed } = useSubscription();

  // 🔄 loading state
  if (isSubscribed === null) {
    return <div>Loading...</div>;
  }

  // 🔒 not subscribed
  if (!isSubscribed) {
    return <Navigate to="/paywall" replace />;
  }

  return children;
}