import { DateScalar } from "@chess-d/api";
import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType({ description: "Represent a connected player" })
export class Player {
	@Field(() => ID, { description: "Session user id" })
	id: number;
	@Field(() => Date, { description: "The first time plyer connected" })
	connectedAt: Date;
}
