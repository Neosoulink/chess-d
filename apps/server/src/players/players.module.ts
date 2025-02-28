import { Module } from "@nestjs/common";

import { PlayersService } from "./services/players.service";
import { PlayersGateway } from "./gateways/players.gateway.js";

@Module({
	providers: [PlayersService, PlayersGateway]
})
export class PlayersModule {}
