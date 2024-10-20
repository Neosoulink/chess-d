import "reflect-metadata";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.js";

import "./assets/styles/main.css";

createRoot(document.getElementById("app")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
