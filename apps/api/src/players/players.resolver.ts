import { Resolver, Query, Mutation, Args, Int, ID } from "@nestjs/graphql";

import { PlayersService } from "./players.service";
import { Player } from "./entities/player.entity";
import { CreatePlayerInput } from "./dto/create-player.input";
import { UpdatePlayerInput } from "./dto/update-player.input";
import { ParseIntPipe } from "@nestjs/common";

@Resolver(() => Player)
export class PlayersResolver {
	constructor(private readonly playersService: PlayersService) {}

	@Mutation(() => Player)
	createPlayer(
		@Args("createPlayerInput") createPlayerInput: CreatePlayerInput
	) {
		return this.playersService.create(createPlayerInput);
	}

	@Query(() => [Player], { name: "players" })
	findAll() {
		return this.playersService.findAll();
	}

	@Query(() => Player, { name: "player" })
	findOne(@Args("id", { type: () => ID }, ParseIntPipe) id: number) {
		return this.playersService.findOne(id);
	}

	@Mutation(() => Player)
	updatePlayer(
		@Args("updatePlayerInput") updatePlayerInput: UpdatePlayerInput
	) {
		return this.playersService.update(updatePlayerInput.id, updatePlayerInput);
	}

	@Mutation(() => Player)
	removePlayer(@Args("id", { type: () => Int }) id: number) {
		return this.playersService.remove(id);
	}
}
