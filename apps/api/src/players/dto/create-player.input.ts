import { InputType, Int, Field } from "@nestjs/graphql";

@InputType()
export class CreatePlayerInput {
	@Field(() => Int, { description: "Example field (placeholder)" })
	exampleField: number;
}
