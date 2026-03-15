import React from "react";

class ReviewErrorBoundary extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null
    };

    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    console.error("Review crash:", error, info);
  }

  resetError() {
    this.setState({
      hasError: false,
      error: null
    });
  }

  render() {

    if (this.state.hasError) {

      return (
        <div style={{ padding: 60, textAlign: "center" }}>

          <h2>⚠️ Review session crashed</h2>

          <p>
            Something unexpected happened.  
            You can continue the session.
          </p>

          <button
            onClick={this.resetError}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#4A90E2",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Continue Review
          </button>

        </div>
      );
    }

    return this.props.children;
  }

}

export default ReviewErrorBoundary;