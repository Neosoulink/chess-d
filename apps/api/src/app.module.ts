import { Module } from "@nestjs/common";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";

import { ExperienceModule } from "./experience/experience.module";

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), "src/schema.gql"),
			playground: false,
			plugins: [ApolloServerPluginLandingPageLocalDefault()]
		}),
		ExperienceModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
