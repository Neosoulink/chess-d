import { Injectable } from "@nestjs/common";

@Injectable()
export class ExperienceService {
	public async log() {
		return "logged";
	}
}
