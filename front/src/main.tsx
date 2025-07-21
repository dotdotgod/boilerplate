import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App";

import { ThemeProvider } from "./components/theme-provider";
const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}
