export default function AssessmentProgress({
  currentLevel,
  questionsAnswered,
}) {
  // progress إحساسي مش ثابت
  const progressPercent = Math.min(
    20 + questionsAnswered * 8,
    90
  );

  return (
    <div
      style={{
        marginBottom: 20,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#faf7fc",
        border: "1px solid #e2d7ee",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 14,
          fontWeight: "bold",
          color: "#4a2f6e",
        }}
      >
        <span>📊 بنقيس مستواك</span>
        <span>المستوى الحالي: {currentLevel}</span>
      </div>

      <div
        style={{
          height: 8,
          background: "#e6dff0",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background:
              "linear-gradient(90deg,#4A90E2,#7B61FF)",
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "#666",
        }}
      >
        كل إجابة بتساعدنا نحدد مستواك بدقة أكتر
      </div>
    </div>
  );
}


