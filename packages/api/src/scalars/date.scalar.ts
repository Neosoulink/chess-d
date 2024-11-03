import { CustomScalar, Scalar } from "@nestjs/graphql";
import { Kind, ValueNode } from "graphql";

@Scalar("Date", (type) => Date)
export class DateScalar implements CustomScalar<number, Date> {
	description = "Date custom scalar type";

	parseValue(value: unknown): Date {
		if (typeof value === "number" || typeof value === "string")
			return new Date(value);

		throw new Error("Value is not valid.");
	}

	serialize(value: unknown): number {
		if (value instanceof Date) return value.getTime();

		throw new Error("Value is not an instance of Date.");
	}

	parseLiteral(ast: ValueNode): Date {
		if (ast.kind === Kind.INT) {
			return new Date(ast.value);
		}
		return null;
	}
}
