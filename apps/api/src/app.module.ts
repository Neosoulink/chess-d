import { join } from "path";
import { APP_PIPE } from "@nestjs/core";
import { Module, ValidationPipe } from "@nestjs/common";
import { DirectiveLocation, GraphQLDirective } from "graphql";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import {
	ApolloComplexityPlugin,
	ApolloLoggingPlugin,
	DateScalar,
	upperDirectiveTransformer
} from "@chess-d/api";
import { PlayersModule } from "./players/players.module";

@Module({
	imports: [
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: () => ({
				autoSchemaFile: join(process.cwd(), "src/schema.gql"),
				playground: false,
				plugins: [ApolloServerPluginLandingPageLocalDefault()],
				transformSchema: (schema) => upperDirectiveTransformer(schema, "upper"),
				buildSchemaOptions: {
					directives: [
						new GraphQLDirective({
							name: "upper",
							locations: [DirectiveLocation.FIELD_DEFINITION]
						})
					]
				}
			})
		}),
		PlayersModule
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
		},
		DateScalar,
		ApolloLoggingPlugin,
		ApolloComplexityPlugin
	]
})
export class AppModule {}
