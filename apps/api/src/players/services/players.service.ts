import { Injectable } from "@nestjs/common";

import { CreatePlayerDto } from "../dto/";

@Injectable()
export class PlayersService {
	constructor() {}

	create(createPlayerInput: CreatePlayerDto) {
		const newPlayer = {
			...createPlayerInput,
			id: 0,
			connectedAt: new Date()
		};

		return newPlayer;
	}
}
