import React from "react";

/**
 * Catches render errors so the user sees a message instead of a blank screen.
 */
export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("RootErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            color: "#212529",
            background: "#f8f9fb",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ fontSize: 20 }}>تعطل التطبيق مؤقتاً</h1>
          <p style={{ color: "#495057", maxWidth: 560 }}>
            حدث خطأ أثناء العرض. افتح أدوات المطوّر (F12) → تبويب Console وانسخ
            الرسالة الحمراء إن احتجت للدعم.
          </p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: "#fff",
              borderRadius: 8,
              overflow: "auto",
              fontSize: 13,
              border: "1px solid #dee2e6",
            }}
          >
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            type="button"
            style={{ marginTop: 20, padding: "10px 18px", cursor: "pointer" }}
            onClick={() => window.location.reload()}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
