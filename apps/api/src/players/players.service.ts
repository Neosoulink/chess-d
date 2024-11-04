import { Injectable } from "@nestjs/common";

import { CreatePlayerInput } from "./dto/create-player.input";
import { UpdatePlayerInput } from "./dto/update-player.input";
import { Player } from "./entities/player.entity";

@Injectable()
export class PlayersService {
	create(createPlayerInput: CreatePlayerInput) {
		return "This action adds a new player";
	}

	findAll(): Player[] {
		return [];
	}

	findOne(id: number): Player {
		return {
			id,
			connectedAt: new Date()
		};
	}

	update(id: number, updatePlayerInput: UpdatePlayerInput) {
		return `This action updates a #${id} player`;
	}

	remove(id: number) {
		return `This action removes a #${id} player`;
	}
}
