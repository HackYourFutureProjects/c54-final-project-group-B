import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppWrapper from "./AppWrapper";

// Suppress external extension errors (e.g., page-events.js)
window.onerror = function (message) {
  if (message && message.toString().includes("reading 'length'")) {
    return true;
  }
  return false;
};

createRoot(document.getElementById("root")).render(
  <AppWrapper>
    <App />
  </AppWrapper>,
);
