import React from "react";

class ReviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      retryKey: 0
    };

    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    console.error("🔥 Review crash:", error, info);
  }

  handleRetry() {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1 // 💣 force remount
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            maxWidth: 500,
            margin: "0 auto"
          }}
        >
          <h2>⚠️ Review Session Interrupted</h2>

          <p style={{ marginBottom: 20 }}>
            Something went wrong, but your progress is safe.
          </p>

          <button
            onClick={this.handleRetry}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: "#4A90E2",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Continue Review
          </button>

          {/* optional debug */}
          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                marginTop: 20,
                textAlign: "left",
                background: "#f5f5f5",
                padding: 10,
                borderRadius: 6,
                fontSize: 12,
                overflow: "auto"
              }}
            >
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    // 💣 key مهم جدًا علشان يعيد mount
    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default ReviewErrorBoundary;