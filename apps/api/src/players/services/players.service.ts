import { Injectable } from "@nestjs/common";

import { CreatePlayerInput } from "../dto/create-player.input";
import { UpdatePlayerInput } from "../dto/update-player.input";

@Injectable()
export class PlayersService {
	constructor() {}

	create(createPlayerInput: CreatePlayerInput) {
		const newPlayer = {
			...createPlayerInput,
			id: 0,
			connectedAt: new Date()
		};

		return newPlayer;
	}

	findAll() {
		return [];
	}

	findOne(id: number) {
		return {
			id,
			connectedAt: new Date()
		};
	}

	update(id: number, updatePlayerInput: UpdatePlayerInput) {
		const editedPlayer = {
			...updatePlayerInput,
			id,
			connectedAt: new Date()
		};

		return editedPlayer;
	}

	remove(id: number) {
		return `This action removes a #${id} player`;
	}
}
