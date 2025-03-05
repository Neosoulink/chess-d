import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: [process.env.CLIENT_HOST]
	});
	await app.listen(3000);

	console.log(`Running on: ${await app.getUrl()}`);
}

bootstrap();
