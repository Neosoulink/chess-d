import { Test, TestingModule } from "@nestjs/testing";
import { PlayersResolver } from "./players.resolver";
import { PlayersService } from "./players.service";

describe("PlayersResolver", () => {
	let resolver: PlayersResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PlayersResolver, PlayersService]
		}).compile();

		resolver = module.get<PlayersResolver>(PlayersResolver);
	});

	it("should be defined", () => {
		expect(resolver).toBeDefined();
	});
});
