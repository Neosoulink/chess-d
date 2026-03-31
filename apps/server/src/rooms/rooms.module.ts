import { Module } from "@nestjs/common";

import { RoomsService } from "./services/rooms.service";
import { RoomsGateway } from "./gateways/rooms.gateway.js";

@Module({
	providers: [RoomsService, RoomsGateway]
})
export class RoomsModule {}
