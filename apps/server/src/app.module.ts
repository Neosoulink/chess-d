import Joi from "@hapi/joi";
import { ConfigModule } from "@nestjs/config";
import { Module, ValidationPipe } from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";

import { RoomsModule } from "./rooms/rooms.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			validationSchema: Joi.object({
				CLIENT_HOST: Joi.string().required()
			})
		}),
		RoomsModule
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
