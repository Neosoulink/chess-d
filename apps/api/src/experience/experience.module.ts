import { Module } from "@nestjs/common";

import { ExperienceService } from "./experience.service";
import { ExperienceResolver } from "./experience.resolver";
import { PubSubModule } from "../pub-sub/pub-sub.module";

@Module({
	imports: [PubSubModule],
	providers: [ExperienceResolver, ExperienceService]
})
export class ExperienceModule {}
