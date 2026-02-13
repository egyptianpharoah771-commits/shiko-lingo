export default function AssessmentResult({
  level,
  questionsAnswered,
  onRestart,
  onContinue,
}) {
  function getMessage(lvl) {
    switch (lvl) {
      case "A1":
        return {
          title: "بداية ممتازة 👌",
          text:
            "واضح إنك في أول الرحلة، وده طبيعي جدًا. الخبر الحلو؟ التقدم هنا سريع وواضح.",
        };
      case "A2":
        return {
          title: "أساس كويس 👏",
          text:
            "عندك قاعدة حلوة في الإنجليزي، ومع شوية ممارسة هتطلع مستوى بسرعة.",
        };
      case "B1":
        return {
          title: "مستوى عملي 💪",
          text:
            "تقدر تتواصل وتفهم أغلب المواقف اليومية. شوية صقل وهيفرقوا جامد.",
        };
      case "B2":
        return {
          title: "مستوى قوي 🔥",
          text:
            "واضح إنك مرتاح مع اللغة. التركيز دلوقتي يبقى على الدقة والطلاقة.",
        };
      case "C1":
      case "C2":
        return {
          title: "مستوى متقدم جدًا 👑",
          text:
            "ده مستوى عالي فعلًا. التحدي الحقيقي دلوقتي هو الاحتراف والتميز.",
        };
      default:
        return {
          title: "نتيجة التقييم",
          text: "",
        };
    }
  }

  const message = getMessage(level);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        textAlign: "center",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ marginBottom: 10 }}>
        🎯 نتيجتك: {level}
      </h1>

      <h3 style={{ marginBottom: 12 }}>
        {message.title}
      </h3>

      <p style={{ color: "#555", marginBottom: 20 }}>
        {message.text}
      </p>

      <div
        style={{
          background: "#faf7fc",
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
          border: "1px solid #e2d7ee",
        }}
      >
        <p style={{ margin: 0 }}>
          تم تحديد مستواك بناءً على{" "}
          <strong>{questionsAnswered}</strong>{" "}
          سؤال.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={onContinue}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background: "#4A90E2",
            color: "#fff",
          }}
        >
          🚀 ابدأ من مستواك
        </button>

        <button
          onClick={onRestart}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid #4A90E2",
            fontWeight: "bold",
            cursor: "pointer",
            background: "#fff",
            color: "#4A90E2",
          }}
        >
          🔄 أعد التقييم
        </button>
      </div>
    </div>
  );
}
