import { Module } from "@nestjs/common";

import { ExperienceService } from "./services/experience.service";
import { ExperienceResolver } from "./resolvers/experience.resolver";
import { ExperienceGateway } from "./gateways/experience.gateway";

@Module({
	providers: [ExperienceResolver, ExperienceService, ExperienceGateway]
})
export class ExperienceModule {}
