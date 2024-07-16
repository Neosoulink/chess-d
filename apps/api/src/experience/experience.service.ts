import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

@Injectable()
export class ExperienceService {
	constructor(private readonly pubsub: PubSub) {}

	public async log() {
		this.pubsub.publish("experienceLogged", {
			experienceLogged: "log triggered"
		});
		return "logged";
	}
}
