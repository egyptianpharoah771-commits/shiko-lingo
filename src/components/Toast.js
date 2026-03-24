import React from "react";
import "./toast.css";

export default function Toast({ type = "success", message }) {
  return <div className={`toast ${type}`}>{message}</div>;
}
