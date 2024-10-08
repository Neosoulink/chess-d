import { Query, Resolver } from "@nestjs/graphql";
import { ExperienceService } from "../services/experience.service";

@Resolver()
export class ExperienceResolver {
	constructor(private readonly experienceService: ExperienceService) {}

	@Query(() => String)
	async log() {
		return this.experienceService.log();
	}
}
