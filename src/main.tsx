
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Recover from stale chunk references after a new deployment.
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    window.location.reload();
  });

  createRoot(document.getElementById("root")!).render(<App />);
  
