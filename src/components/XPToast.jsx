import { useEffect, useState } from "react";

function XPToast() {
  const [xp, setXp] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setXp(e.detail);

      setTimeout(() => {
        setXp(null);
      }, 2000);
    };

    window.addEventListener("xp-earned", handler);

    return () => {
      window.removeEventListener("xp-earned", handler);
    };
  }, []);

  if (!xp) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#4CAF50",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 10,
        fontWeight: "bold",
        zIndex: 9999,
        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
        animation: "xpPop 0.4s ease",
      }}
    >
      +{xp} XP 🎉
    </div>
  );
}

export default XPToast;