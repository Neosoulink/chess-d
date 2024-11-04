import { CreatePlayerInput } from "./create-player.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdatePlayerInput extends PartialType(CreatePlayerInput) {
	@Field(() => Int)
	id: number;
}
