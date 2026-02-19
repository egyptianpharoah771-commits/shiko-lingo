import { useSubscriptionContext } from "../context/SubscriptionContext";

export const useSubscription = () => {
  const context = useSubscriptionContext();

  if (!context) {
    throw new Error(
      "useSubscription must be used inside SubscriptionProvider"
    );
  }

  return context;
};