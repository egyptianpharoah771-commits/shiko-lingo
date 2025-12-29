import { useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

// 🔐 Feature Gating + Identity
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

// 🤖 AI
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

const MAX_SECONDS = 90;

/* ===== B1 Lesson Prompts ===== */
const B1_PROMPTS = {
  lesson1: {
    title: "City vs Countryside",
    prompt:
      "Do you prefer living in the city or in the countryside? Why?",
    bullets: [
      "Where do you live now?",
      "One advantage of city life",
      "One advantage of countryside life",
      "Your personal preference",
    ],
  },
  lesson2: {
    title: "Technology in Daily Life",
    prompt: "How has technology changed your daily life?",
    bullets: [
      "Technology you use every day",
      "One positive effect",
      "One negative effect",
      "Your opinion",
    ],
  },
};

function SpeakingLessonB1() {
  const { lessonId } = useParams();

  /* ===== Feature gating + identity ===== */
  const { canAccess, userId, packageName } =
    useFeatureAccess({
      skill: "Speaking",
      level: "B1",
    });

  const audioKey = `speaking-b1-audio-${lessonId}`;

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingReady, setRecordingReady] =
    useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const lesson = B1_PROMPTS[lessonId];

  /* ===== Reset on lesson change ===== */
  useEffect(() => {
    if (!canAccess) return;

    setAudioURL(null);
    setRecordingReady(false);
    setSubmitted(false);
    setSeconds(0);
    setError("");
    setAiStatus("IDLE");
    setAiMessage("");
  }, [lessonId, canAccess]);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => {
      if (timerRef.current)
        clearInterval(timerRef.current);

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  /* ===== Load saved recording ===== */
  useEffect(() => {
    if (!canAccess) return;

    const saved = localStorage.getItem(audioKey);
    if (saved) {
      setAudioURL(saved);
      setRecordingReady(true);
      setSubmitted(true);
    }
  }, [audioKey, canAccess]);

  /* ===== Lock ===== */
  if (!canAccess) {
    return (
      <LockedFeature title="Speaking B1 Lesson" />
    );
  }

  if (!lesson) {
    return <p>Lesson not found.</p>;
  }

  /* ===== Start Recording ===== */
  const startRecording = async () => {
    if (isRecording || submitted) return;

    if (
      !navigator.mediaDevices ||
      typeof MediaRecorder === "undefined"
    ) {
      setError(
        "Your browser does not support audio recording."
      );
      return;
    }

    setError("");
    setSeconds(0);
    audioChunksRef.current = [];

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0)
          audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(
          audioChunksRef.current,
          { type: "audio/webm" }
        );
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setRecordingReady(true);
        stream
          .getTracks()
          .forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            recorder.stop();
            clearInterval(timerRef.current);
            setIsRecording(false);
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Microphone access denied.");
    }
  };

  /* ===== Stop Recording ===== */
  const stopRecording = () => {
    if (!isRecording) return;

    mediaRecorderRef.current?.stop();
    setIsRecording(false);

    if (timerRef.current)
      clearInterval(timerRef.current);
  };

  /* ===== Submit ===== */
  const handleSubmit = () => {
    if (submitted || !recordingReady) return;

    localStorage.setItem(audioKey, audioURL);

    markLessonCompleted(
      STORAGE_KEYS.SPEAKING_COMPLETED,
      `B1-${lessonId}`
    );

    setSubmitted(true);
  };

  /* ===== Ask AI Tutor ===== */
  const handleAskAI = async () => {
    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Speaking",
      level: "B1",
      lessonTitle: lesson.title,
      prompt: lesson.prompt,
      bullets: lesson.bullets,
      userId,
      packageName,
    });

    if (result.status === "SUCCESS") {
      setAiStatus("SUCCESS");
      setAiMessage(result.message);
    } else if (result.status === "LIMIT") {
      setAiStatus("LIMIT");
      setAiMessage(result.message);
    } else {
      setAiStatus("ERROR");
      setAiMessage(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>🎤 Speaking B1 – {lesson.title}</h2>
      <p>{lesson.prompt}</p>

      <ul>
        {lesson.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>

      {isRecording && (
        <p style={{ color: "red" }}>
          🔴 Recording… {seconds}s
        </p>
      )}

      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={submitted}
        >
          🎙️ Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>
          ⏹️ Stop
        </button>
      )}

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      {audioURL && (
        <>
          <p>🎧 Your recording:</p>
          <audio controls src={audioURL} />
        </>
      )}

      <button
        onClick={handleSubmit}
        disabled={!recordingReady || submitted}
        style={{ marginTop: "10px" }}
      >
        Submit Recording
      </button>

      {submitted && (
        <button
          onClick={handleAskAI}
          style={{
            marginTop: "12px",
            background: "#111",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
          }}
        >
          🤖 Ask AI Tutor
        </button>
      )}

      <Link to="/speaking/B1">
        <button style={{ marginTop: "20px" }}>
          Back to B1 Lessons
        </button>
      </Link>

      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}

export default SpeakingLessonB1;
