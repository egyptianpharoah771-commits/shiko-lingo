import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FeedbackBox from "../components/FeedbackBox";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";
import STORAGE_KEYS from "../utils/storageKeys";

function ListeningLevel() {
  const { level } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canAccess } = useFeatureAccess({ skill: "Listening", level });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // 1. قراءة الفهرس (المصدر الاحتياطي)
    fetch(`/listening/${level}/index.json`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!mounted) return;
        
        // استخراج المصفوفة سواء كانت مباشرة أو داخل object
        const baseLessons = Array.isArray(data) ? data : (data?.lessons || []);

        // 2. محاولة دمج البيانات من الملفات التفصيلية
        const mergedLessons = await Promise.all(
          baseLessons.map(async (lesson) => {
            try {
              const res = await fetch(`/listening/${level}/${lesson.id}/data.json`);
              
              // لو الملف مش موجود أو فاضي تماماً
              if (!res.ok) return lesson;
              
              const text = await res.text();
              if (!text || text.trim() === "" || text === "{}") return lesson;

              const realData = JSON.parse(text);

              return {
                ...lesson,
                // لو الـ title في data.json موجود نستخدمه، غير كدة نلتزم باللي في الفهرس
                title: realData.title || lesson.title,
                description: realData.description || lesson.description
              };
            } catch (err) {
              console.warn(`Could not load data for ${lesson.id}, using index fallback.`);
              return lesson; // العودة للفهرس في حالة الخطأ
            }
          })
        );

        setLessons(mergedLessons);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [level]);

  if (!canAccess) return <LockedFeature title={`Listening Level ${level}`} />;
  if (loading) return <p style={{textAlign: "center", padding: "40px"}}>Loading Lessons...</p>;

  const completedLessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LISTENING_COMPLETED)) || [];

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{marginBottom: "20px"}}>🎧 Level {level} Lessons</h2>
      
      {lessons.length === 0 && <p>No lessons found.</p>}

      {lessons.map((lesson, index) => {
        const lessonKey = `${level}-${lesson.id}`;
        const isCompleted = completedLessons.includes(lessonKey);
        
        return (
          <div key={lesson.id} style={cardStyle}>
            <div style={{flex: 1}}>
              <h4 style={{margin: "0 0 5px"}}>Lesson {index + 1}: {lesson.title}</h4>
              <p style={{margin: 0, color: "#666", fontSize: "0.9rem"}}>{lesson.description}</p>
            </div>
            
            <Link to={`/listening/${level}/${lesson.id}`}>
              <button style={btnStyle(isCompleted)}>
                {isCompleted ? "Review" : "Start"}
              </button>
            </Link>
          </div>
        );
      })}
      
      <FeedbackBox skill="Listening" level={level} />
    </div>
  );
}

const cardStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "15px",
  marginBottom: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};

const btnStyle = (done) => ({
  backgroundColor: done ? "#6ab04c" : "#4A90E2",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  marginLeft: "10px"
});

export default ListeningLevel;