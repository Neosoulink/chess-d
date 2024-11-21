import { Test, TestingModule } from "@nestjs/testing";
import { PlayersGateway } from "./players.gateway.js";

describe("PlayersGateway", () => {
	let gateway: PlayersGateway;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PlayersGateway]
		}).compile();

		gateway = module.get<PlayersGateway>(PlayersGateway);
	});

	it("should be defined", () => {
		expect(gateway).toBeDefined();
	});
});
