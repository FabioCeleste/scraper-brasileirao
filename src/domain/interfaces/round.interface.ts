import { CreateRoundData, RoundData } from '../entities/round.entity';

export interface IRoundService {
  createRoundIfNotExists(roundData: CreateRoundData): Promise<RoundData | null>;

  bulkCreateRounds(roundsData: CreateRoundData[]): Promise<{
    created: RoundData[];
    skipped: number;
  }>;
  findAll(): Promise<RoundData[]>;
}
