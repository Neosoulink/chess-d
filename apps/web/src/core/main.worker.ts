import "reflect-metadata";

import { launchApp } from "@quick-threejs/reactive/worker";
import { setup as onReady } from "@chess-d/chessboard";

launchApp({ onReady });
