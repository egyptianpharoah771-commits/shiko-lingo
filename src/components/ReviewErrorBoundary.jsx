import React from "react";

class ReviewErrorBoundary extends React.Component {

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Review crash:", error);
  }

  render() {

    if (this.state.hasError) {
      return (
        <div style={{ padding: 60, textAlign: "center" }}>
          <h2>⚠️ Something went wrong</h2>
          <p>Reload the review session.</p>
          <button onClick={() => window.location.reload()}>
            Restart Review
          </button>
        </div>
      );
    }

    return this.props.children;
  }

}

export default ReviewErrorBoundary;