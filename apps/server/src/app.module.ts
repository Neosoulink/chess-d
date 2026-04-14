import Joi from "@hapi/joi";
import { ConfigModule } from "@nestjs/config";
import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";

import { AiModule } from "./ai/ai.module";
import { RoomsModule } from "./rooms/rooms.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				CLIENT_HOST: Joi.string().required(),
				EXTRA_CORS_ORIGINS: Joi.string().optional(),
				OPENAI_API_KEY: Joi.string().optional(),
				OPENAI_BASE_URL: Joi.string().optional(),
				OPENAI_MODEL: Joi.string().optional(),
				GEMINI_API_KEY: Joi.string().optional(),
				GEMINI_MODEL: Joi.string().optional(),
				ANTHROPIC_API_KEY: Joi.string().optional(),
				ANTHROPIC_MODEL: Joi.string().optional()
			})
		}),
		RoomsModule,
		AiModule
	],
	providers: [
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				transform: true,
				forbidNonWhitelisted: true,
				forbidUnknownValues: true,
				transformOptions: {
					enableImplicitConversion: true
				}
			})
		}
	]
})
export class AppModule {}
