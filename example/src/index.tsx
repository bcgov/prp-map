import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@bcgov/bc-sans/css/BC_Sans.css";
import "@digitalspace/bcparks-bootstrap-theme/dist/css/bootstrap-theme.min.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
