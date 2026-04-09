import React from "react";

class ReviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      retryKey: 0,
    };

    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error("🔥 Review crash:", error, info);
  }

  handleRetry() {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }));
  }

  render() {
    if (this.state.hasError) {
      console.error("FULL ERROR:", this.state.error);

      return (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <h2>⚠️ Review Crash</h2>

          <p style={{ marginBottom: 20 }}>
            {this.state.error?.message || "Unknown error"}
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
              fontWeight: "bold",
            }}
          >
            Retry
          </button>

          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                marginTop: 20,
                textAlign: "left",
                background: "#f5f5f5",
                padding: 10,
                borderRadius: 6,
                fontSize: 12,
                overflow: "auto",
              }}
            >
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default ReviewErrorBoundary;
