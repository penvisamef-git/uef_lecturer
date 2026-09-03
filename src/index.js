import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Route from "./route/route.component";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/index.css";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Route />
  </React.StrictMode>
);

reportWebVitals();
