import { gsap } from "gsap";
import { FC, useEffect, useRef, useState } from "react";

import { useGameStore } from "../_stores";

export const LoadingWallComponent: FC = () => {
	const { app, state } = useGameStore();
	const [loadProgress, setLoadProgress] = useState(0);

	const loaderWallRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let tween: ReturnType<typeof gsap.to> | undefined = undefined;

		if (loaderWallRef.current) {
			loaderWallRef.current.style.opacity = "1";

			if (["playing", "idle"].includes(state))
				tween = gsap.to(loaderWallRef.current.style, {
					duration: 0.3,
					delay: 1,
					opacity: "0",
					onComplete: () => {
						if (loaderWallRef.current)
							loaderWallRef.current.style.pointerEvents = "none";
					}
				});
		}

		return () => {
			tween?.progress(1).kill();
		};
	}, [state]);

	useEffect(() => {
		const sub = app?.module.loader.getLoad$().subscribe((load) => {
			setLoadProgress((load.loadedCount * 100) / load.toLoadCount);
		});

		return () => {
			sub?.unsubscribe();
		};
	}, [app]);

	return (
		<div
			ref={loaderWallRef}
			className="fixed top-0 left-0 w-full h-full bg-black z-[9999] flex justify-center items-center"
		>
			<div className="w-96 bg-gray-900">
				<div
					className="h-2 bg-white transition-[width] ease-in-out"
					style={{ width: `${loadProgress}%` }}
				/>
			</div>
		</div>
	);
};
