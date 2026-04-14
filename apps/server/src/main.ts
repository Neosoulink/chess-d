import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

function corsOrigins(): string[] | boolean {
	const primary = process.env.CLIENT_HOST;
	if (!primary) return false;

	const out = new Set<string>([primary]);
	try {
		const u = new URL(primary);
		if (u.hostname === "localhost") {
			out.add(primary.replace("://localhost", "://127.0.0.1"));
		}
		if (u.hostname === "127.0.0.1") {
			out.add(primary.replace("://127.0.0.1", "://localhost"));
		}
	} catch {
		// ignore invalid URL
	}

	const extra = process.env.EXTRA_CORS_ORIGINS;
	if (extra)
		for (const o of extra.split(",").map((s) => s.trim())) {
			if (o) out.add(o);
		}

	return [...out];
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const origin = corsOrigins();
	app.enableCors({
		origin,
		methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Accept"]
	});
	await app.listen(3000);

	console.log(`Running on: ${await app.getUrl()}`);
	console.log(`CORS allowed origins: ${JSON.stringify(origin)}`);
}

bootstrap();
