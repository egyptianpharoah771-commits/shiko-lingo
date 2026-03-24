export default function AssessmentIntro({ onStart }) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "60px auto",
        textAlign: "center",
        padding: 24,
      }}
    >
      <h1 style={{ marginBottom: 12 }}>
        🎯 Level Assessment
      </h1>

      <p style={{ fontSize: 16, color: "#555" }}>
        الاختبار ده معمول علشان يحدد مستواك الحقيقي في
        الإنجليزي، من غير ضغط، ومن غير رسوب.
      </p>

      <div
        style={{
          textAlign: "left",
          marginTop: 24,
          background: "#faf7fc",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #e2d7ee",
        }}
      >
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>الأسئلة بتبدأ سهلة وتعلى تدريجيًا</li>
          <li>عدد الأسئلة متغير حسب إجاباتك</li>
          <li>مفيش وقت محدد</li>
          <li>النتيجة هتساعدنا نبدأ من مستواك الصح</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        style={{
          marginTop: 30,
          padding: "14px 26px",
          fontSize: 16,
          fontWeight: "bold",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background: "#4A90E2",
          color: "#fff",
        }}
      >
        🚀 ابدأ التقييم
      </button>
    </div>
  );
}


