import { createRoot } from "react-dom/client";
import { App } from "./App";

import "./reset.scss";
import "./index.scss";

const el = document.getElementById("app");

if (!el) {
    throw new Error("Root element not found!");
}

const root = createRoot(el);

root.render(<App />);
