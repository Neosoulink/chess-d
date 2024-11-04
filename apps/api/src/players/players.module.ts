import { Module } from "@nestjs/common";
import { PlayersService } from "./players.service";
import { PlayersResolver } from "./players.resolver";

@Module({
	providers: [PlayersResolver, PlayersService]
})
export class PlayersModule {}
