import { FC, useCallback, useEffect, useState } from "react";

import { cn } from "@/shared/utils";

import { Button } from "../core/button";
import { Modal } from "../core/modal";

const MOBILE_WARNING_STORAGE_KEY = "chess-d-mobile-support-warning-dismissed";
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const MOBILE_SUPPORT_ISSUE_URL =
	"https://github.com/Neosoulink/chess-d/issues/new";

export const GlobalMobileWarning: FC = () => {
	const [isNarrowViewport, setIsNarrowViewport] = useState(() =>
		typeof window !== "undefined"
			? window.matchMedia(MOBILE_MEDIA_QUERY).matches
			: false
	);
	const [wasDismissedThisSession, setWasDismissedThisSession] = useState(() => {
		try {
			return sessionStorage.getItem(MOBILE_WARNING_STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});

	useEffect(() => {
		const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
		const onChange = () => setIsNarrowViewport(mq.matches);
		onChange();
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);

	const dismiss = useCallback(() => {
		try {
			sessionStorage.setItem(MOBILE_WARNING_STORAGE_KEY, "1");
		} catch {
			// do nothing...
		}
		setWasDismissedThisSession(true);
	}, []);

	const show = isNarrowViewport && !wasDismissedThisSession;

	return (
		<Modal
			show={show}
			onClose={dismiss}
			className="z-70 flex items-center justify-center"
			aria-labelledby="mobile-support-modal-title"
			aria-describedby="mobile-support-modal-desc"
		>
			{show && (
				<>
					<div
						className={cn(
							"max-w-md w-full rounded-sm border border-light/15 bg-dark/90 p-6 shadow-lg",
							"flex flex-col gap-4 text-center z-10"
						)}
					>
						<h2
							id="mobile-support-modal-title"
							className="text-lg font-medium text-balance"
						>
							Sorry — small screens not fully supported yet
						</h2>
						<p
							id="mobile-support-modal-desc"
							className="text-sm text-light/85 leading-relaxed text-pretty"
						>
							This experience was mostly tuned for desktop and larger displays.
							On phones and narrow viewports you may find cropped layouts,
							awkward controls...
						</p>

						<p className="text-sm text-light/85 leading-relaxed text-pretty">
							Let me know if having a better mobile or small-screen experience
							matters to you by{" "}
							<a
								href={MOBILE_SUPPORT_ISSUE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="text-neon-gold underline underline-offset-2 hover:text-light transition-colors"
							>
								opening a GitHub issue
							</a>
						</p>
						<Button
							type="button"
							className="w-full justify-center text-base mt-1"
							onClick={dismiss}
						>
							Continue anyway
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
};
