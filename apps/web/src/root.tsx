import "reflect-metadata";

import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { Router } from "./router";

import "./assets/styles/global.css";

gsap.registerPlugin(SplitText);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Router />
		</BrowserRouter>
	</StrictMode>
);
