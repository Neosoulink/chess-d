import { gsap } from "gsap";
import { FC, useEffect, useRef, useState } from "react";

import { useGameStore, useLoaderStore } from "../../_stores";

export const Loader: FC = () => {
	const { app } = useGameStore();
	const { isLoading } = useLoaderStore();
	const [loadProgress, setLoadProgress] = useState(0);

	const loaderWallRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let tween: ReturnType<typeof gsap.to> | undefined = undefined;
		const loaderWall = loaderWallRef.current;

		if (!isLoading && loaderWall)
			tween = gsap.to(loaderWall.style, {
				duration: 0.3,
				delay: 0.5,
				opacity: "0",
				onComplete: () => {
					if (loaderWall) loaderWall.style.pointerEvents = "none";
				}
			});

		return () => {
			tween?.progress(1).kill();
			if (loaderWall) loaderWall.style.opacity = "1";
		};
	}, [isLoading]);

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
			className="fixed top-0 left-0 w-full h-full bg-black z-20 flex justify-center items-center"
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
