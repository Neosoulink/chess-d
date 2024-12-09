import "reflect-metadata";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { Router } from "./routes";

import "./assets/styles/main.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Router />
		</BrowserRouter>
	</StrictMode>
);
