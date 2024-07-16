import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceGateway } from './experience.gateway';

describe('ExperienceGateway', () => {
  let gateway: ExperienceGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExperienceGateway],
    }).compile();

    gateway = module.get<ExperienceGateway>(ExperienceGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
