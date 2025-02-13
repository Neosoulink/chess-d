import { SupportedAiModel } from "@chess-d/ai";
import { FC, useState } from "react";
import { Link, useNavigate } from "react-router";

import { MainMenuSection } from "../../../shared/enum";
import { useMainMenuStore } from "../../_stores";

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
		<section className="flex flex-col gap-8 items-start">
			<form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
				<h2 className="text-xl">Enter The infos:</h2>

				<button
					type="button"
					className="shadow-md p-2 flex justify-center items-center gap-2 rounded capitalize w-fit"
					onClick={() => setJoinRoom(!joinRoom)}
				>
					<div
						className={`w-4 h-4 rounded-full ${joinRoom ? "bg-gray-900" : "bg-gray-200"}`}
					/>
					Join Room
				</button>

				{joinRoom && (
					<div>
						<label
							htmlFor="room-id"
							className="block mb-2 text-sm font-medium capitalize"
						>
							Enter the room ID
						</label>
						<input
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
					<button type="submit" className="shadow-md p-2 rounded capitalize">
						{joinRoom ? "Play with opponent" : "New online match"}
					</button>

					<Link
						to="/play?mode=human&random=true"
						type="submit"
						className="shadow-md p-2 rounded capitalize flex justify-center items-center"
					>
						Random Match
					</Link>
				</div>
			</form>

			<button
				className="shadow-md p-2 rounded"
				onClick={() => setSection(MainMenuSection.newGame)}
			>
				Go Back
			</button>
		</section>
	);
};
