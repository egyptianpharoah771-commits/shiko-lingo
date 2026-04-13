import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";
import {
  getLessonFolder,
  isLastLesson,
} from "../utils/lessonUtils";

// 🔐 Feature Gating + Identity
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

// 🤖 AI
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";
import { SPEAKING_CURRICULUM } from "./speakingCurriculum";

function SpeakingLesson() {
  const { level, lessonId } = useParams();

  /* ===== Normalize lessonId ===== */
  const normalizedLessonId = lessonId?.includes("lesson")
    ? lessonId
    : lessonId?.split("-").pop(); // A1-lesson1 → lesson1

  const lessonNumber = Number(
    normalizedLessonId?.replace("lesson", "")
  );

  /* ===== Feature access ===== */
  const { canAccess, userId, packageName } =
    useFeatureAccess({
      skill: "Speaking",
      level,
    });

  const answerKey = `speaking-answer-${level}-lesson${lessonNumber}`;
  const audioKey = `speaking-audio-${level}-lesson${lessonNumber}`;
  const MAX_SECONDS = 75;

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordingReady, setRecordingReady] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordError, setRecordError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  /* ===== Reset on change ===== */
  useEffect(() => {
    if (!canAccess) return;

    const saved = localStorage.getItem(answerKey);
    const savedAudio = localStorage.getItem(audioKey);
    setAnswer(saved || "");
    setAudioURL(savedAudio || "");
    setRecordingReady(!!savedAudio);
    setSubmitted(!!saved || !!savedAudio);
    setSeconds(0);
    setRecordError("");

    setAiStatus("IDLE");
    setAiMessage("");
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [answerKey, audioKey, canAccess]);

  /* ===== Lock ===== */
  if (!canAccess) {
    return <LockedFeature title="Speaking Lesson" />;
  }

  const lessonData =
    SPEAKING_CURRICULUM[level]?.[normalizedLessonId];

  if (!lessonData) {
    return <p>Lesson not found.</p>;
  }

  const { content, questions } = lessonData;
  const hasAnswer = answer.trim().length > 0;
  const canSubmit = recordingReady || hasAnswer;

  const lastLesson = isLastLesson(
    getLessonFolder(level, "speaking"),
    lessonNumber
  );

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    if (submitted || isRecording) return;
    setRecordError("");
    setSeconds(0);
    audioChunksRef.current = [];

    if (typeof MediaRecorder === "undefined") {
      setRecordError("Recording is not supported in this browser.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const isSecure = window.isSecureContext || window.location.hostname === "localhost";
      setRecordError(
        isSecure
          ? "Microphone API is unavailable in this browser."
          : "Microphone requires HTTPS (or localhost). Please open the app on a secure URL."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setRecordingReady(true);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      const errorName = err?.name || "";
      if (errorName === "NotAllowedError" || errorName === "SecurityError") {
        setRecordError("Microphone permission denied. Please allow microphone access in browser settings.");
      } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
        setRecordError("No microphone device was found on this device.");
      } else if (errorName === "NotReadableError" || errorName === "TrackStartError") {
        setRecordError("Microphone is busy or unavailable. Close other apps using the mic and try again.");
      } else if (errorName === "OverconstrainedError") {
        setRecordError("Microphone constraints are not supported on this device.");
      } else {
        setRecordError("Could not start microphone recording. Please check browser and device permissions.");
      }
    }
  };

  /* ===== Submit ===== */
  const handleSubmit = () => {
    if (submitted || !canSubmit) return;

    if (hasAnswer) localStorage.setItem(answerKey, answer);
    if (audioURL) localStorage.setItem(audioKey, audioURL);

    markLessonCompleted(
      STORAGE_KEYS.SPEAKING_COMPLETED,
      `${level}-lesson${lessonNumber}`
    );

    setSubmitted(true);
  };

  /* ===== Ask AI Tutor ===== */
  const handleAskAI = async () => {
    if (!canSubmit) return;

    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Speaking",
      level,
      lessonTitle: content.title,
      prompt: content.prompt,
      studentText: answer || `Audio response submitted (${seconds}s).`,
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
      <h2>{content.title}</h2>

      {content.prompt && (
        <p style={{ fontWeight: "bold" }}>
          {content.prompt}
        </p>
      )}

      {Array.isArray(content.tips) && (
        <ul>
          {content.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}

      <h3>Guiding Questions</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>{q.question}</li>
        ))}
      </ul>

      {/* 🤖 AI Tutor (post-submit only to reduce AI calls) */}
      <button
        onClick={handleAskAI}
        disabled={!submitted}
        style={{
          marginBottom: "12px",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#111",
          color: "white",
          fontWeight: "bold",
          cursor: submitted ? "pointer" : "not-allowed",
          opacity: submitted ? 1 : 0.6,
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <h3>Speak Your Answer</h3>
      <p style={{ marginTop: 0, color: "#666" }}>
        Record your voice first. Writing below is optional support.
      </p>

      {isRecording ? (
        <button onClick={stopRecording} disabled={submitted}>
          ⏹ Stop Recording ({seconds}s)
        </button>
      ) : (
        <button onClick={startRecording} disabled={submitted}>
          🎙 Start Recording
        </button>
      )}

      {recordError && (
        <p style={{ color: "crimson", marginTop: 8 }}>{recordError}</p>
      )}

      {audioURL && (
        <div style={{ marginTop: 12 }}>
          <p style={{ marginBottom: 6 }}>🎧 Your recording:</p>
          <audio controls src={audioURL} style={{ width: "100%" }} />
        </div>
      )}

      <h3 style={{ marginTop: 18 }}>Optional Writing Support</h3>
      <textarea
        rows={6}
        value={answer}
        disabled={submitted}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      <button
        onClick={handleSubmit}
        disabled={submitted || !canSubmit}
        style={{
          marginTop: "10px",
          opacity:
            submitted || !canSubmit ? 0.6 : 1,
        }}
      >
        Submit
      </button>

      {submitted && (
        <div style={{ marginTop: "20px" }}>
          {lastLesson ? (
            <Link to={`/speaking/${level}`}>
              Back to {level} lessons
            </Link>
          ) : (
            <Link
              to={`/speaking/${level}/lesson${
                lessonNumber + 1
              }`}
            >
              ▶️ Next Lesson
            </Link>
          )}
        </div>
      )}

      {/* 🤖 AI Modal */}
      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}

export default SpeakingLesson;


