import { SupportedAiModel } from "@chess-d/ai";
import { FC, useState } from "react";
import { Link, useNavigate } from "react-router";

import { MainMenuSection } from "../../../../shared/enum";
import { useMainMenuStore } from "../../../_stores";
import { ModalSection } from "../modal-section";
import { Button, Input } from "../../core";

export const NewGameHumanSection: FC = () => {
	const navigate = useNavigate();
	const { setSection } = useMainMenuStore();

	const [joinRoom, setJoinRoom] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		let to = "/play?mode=human";

		e.preventDefault();

		if (joinRoom) {
			const formData = new FormData(e.currentTarget);
			const roomId = formData.get("room-id") as
				| keyof typeof SupportedAiModel
				| null;

			if (roomId) to = `${to}&roomID=${roomId}`;
		}

		navigate(to);
	};

	return (
		<ModalSection
			title="New Game (Online)"
			onGoBack={() => setSection(MainMenuSection.newGame)}
		>
			<form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
				<h2 className="text-xl">Enter The infos:</h2>

				<Button
					type="button"
					className="p-2 bg-black/30 w-fit"
					onClick={() => setJoinRoom(!joinRoom)}
				>
					<div
						className={`w-4 h-4 rounded-full border ${joinRoom ? "bg-white" : ""}`}
					/>
					Join Room
				</Button>

				{joinRoom && (
					<div>
						<label
							htmlFor="room-id"
							className="block mb-2 text-sm font-medium capitalize"
						>
							Enter the room ID
						</label>

						<Input
							id="room-id"
							name="room-id"
							type="text"
							placeholder="Room ID"
							required
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 capitalize"
						/>
					</div>
				)}

				<div className="flex flex-col gap-2">
					<Button type="submit" className="p-2 bg-black/30">
						{joinRoom ? "Play with opponent" : "New online match"}
					</Button>

					<Button
						asLink
						to="/play?mode=human&random=true"
						className="p-2 bg-black/30"
					>
						Random Match
					</Button>
				</div>
			</form>
		</ModalSection>
	);
};
