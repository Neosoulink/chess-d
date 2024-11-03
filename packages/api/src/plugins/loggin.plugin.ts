import { ApolloServerPlugin, GraphQLRequestListener } from "@apollo/server";
import { Plugin } from "@nestjs/apollo";

@Plugin()
export class ApolloLoggingPlugin implements ApolloServerPlugin {
	async requestDidStart(): Promise<GraphQLRequestListener<any>> {
		console.log("Request started");
		return {
			async willSendResponse() {
				console.log("Will send response");
			}
		};
	}
}
