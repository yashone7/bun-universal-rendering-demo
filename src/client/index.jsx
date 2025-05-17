import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "../shared/App";

// Client-side hydration
const container = document.getElementById("root");
if (container) {
  hydrateRoot(
    container,
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

// Notify when hydration is complete
console.log("🚀 Client-side hydration complete!");
