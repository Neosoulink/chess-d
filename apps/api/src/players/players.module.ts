import { Module } from "@nestjs/common";

import { PlayersService } from "./players.service";
import { PlayersGateway } from "./gateways/players.gateway";

@Module({
	providers: [PlayersService, PlayersGateway]
})
export class PlayersModule {}
