import { FC } from "react";
import { Button, Modal } from "../core";
import { useHistoryModalStore } from "../../_stores";
import { Icon } from "../core/icon";

export interface HistoryModalProps {}

export const HistoryModal: FC<HistoryModalProps> = () => {
	const { isOpen, setIsOpen } = useHistoryModalStore();

	const preventPropagation = (e: React.MouseEvent) => e.stopPropagation();

	return (
		<Modal show={isOpen} onClick={() => setIsOpen(false)}>
			<h2 className="text-6xl" onClick={preventPropagation}>
				Moves History
			</h2>

			<div
				className="bg-gray-50 text-gray-950 p-12 rounded-xl min-w-[584px] relative"
				onClick={preventPropagation}
			>
				<Button
					className="absolute top-5 right-5 text-xl h-10 w-10 flex justify-center items-center rounded-full shadow-md hover:bg-gray-100 select-none hover:shadow-lg transition-[shadow,background-color] duration-300"
					onClick={() => setIsOpen(false)}
				>
					{/* <Icon.Cross size={24} /> */}
				</Button>
				hi
			</div>
		</Modal>
	);
};
