import { FC, MouseEventHandler, PropsWithChildren } from "react";

import { Button } from "../core";
import { Icon } from "../core/icon";
import { PiecesPositionEditor } from "./pieces-position-editor";

export interface ModalSectionProps extends PropsWithChildren {
	title?: string;
	editPiecesPosition?: boolean;
	onGoBack?: MouseEventHandler<HTMLButtonElement>;
}

export const ModalSection: FC<ModalSectionProps> = ({
	title,
	children,
	editPiecesPosition = true,
	onGoBack
}) => {
	return (
		<section className="flex items-center justify-center w-dvw h-dvh">
			<div className="flex flex-col gap-10 w-[584px]">
				{!!title && <h1 className="text-6xl text-center">{title}</h1>}

				{editPiecesPosition && <PiecesPositionEditor />}

				{children}

				<hr className="h-0.5 w-full border-none bg-gradient-to-r from-white/0 via-white to-white/0" />

				<div>
					{!!onGoBack && (
						<Button
							className="p-2 rounded font-kelly-slab text-xl shadow-none bg-black/20 hover:bg-black/30 text-shadow"
							onClick={onGoBack}
						>
							<Icon.ArrowBackward />
							Go Back
						</Button>
					)}
				</div>
			</div>
		</section>
	);
};
