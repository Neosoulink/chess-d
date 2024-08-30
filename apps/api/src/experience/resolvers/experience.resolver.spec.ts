import { Test, TestingModule } from "@nestjs/testing";
import { ExperienceResolver } from "./experience.resolver";
import { ExperienceService } from "./experience.service";

describe("ExperienceResolver", () => {
	let resolver: ExperienceResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ExperienceResolver, ExperienceService]
		}).compile();

		resolver = module.get<ExperienceResolver>(ExperienceResolver);
	});

	it("should be defined", () => {
		expect(resolver).toBeDefined();
	});
});
