import { Module } from "@nestjs/common";

import { ExperienceService } from "./services/experience.service";
import { ExperienceResolver } from "./resolvers/experience.resolver";

@Module({
	providers: [ExperienceResolver, ExperienceService]
})
export class ExperienceModule {}
