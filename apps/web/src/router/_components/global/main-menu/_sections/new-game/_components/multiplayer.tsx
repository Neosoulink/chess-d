import { FC } from "react";

import { cn } from "@/shared/utils";
import { MainMenuLabelInput } from "../../../_components/label-input";

export const MainMenuNewGameMultiplayer: FC<{
	joinRoom: boolean;
	roomId?: string;
	toggleJoin(): void;
	setRoomId(roomId: string): void;
}> = ({ joinRoom, roomId, toggleJoin, setRoomId }) => {
	return (
		<div className="w-full flex flex-col gap-2">
			<MainMenuLabelInput
				id="room-id"
				disabled={!joinRoom}
				labelProps={{
					children: "Room ID"
				}}
				inputProps={{
					name: "room-id",
					type: "text",
					placeholder: "Room ID",
					required: true,
					className: cn(!joinRoom && "opacity-50 pointer-events-none"),
					value: roomId || "",
					onChange: (e) => setRoomId(e.target.value)
				}}
				extraActions={[
					{
						label: "Random",
						icon: joinRoom ? "Link" : "Globe",
						action: toggleJoin
					}
				]}
			/>
		</div>
	);
};
