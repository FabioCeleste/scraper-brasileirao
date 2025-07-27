import { CreateRoundData, RoundData } from '../entities/round.entity';

export interface IRoundService {
  createRoundIfNotExists(roundData: CreateRoundData): Promise<RoundData | null>;
  bulkCreateRounds(roundsData: CreateRoundData[]): Promise<{
    created: RoundData[];
    skipped: number;
  }>;
  findById(id: number): Promise<RoundData | null>;
  findAll(): Promise<RoundData[]>;
  updateRound(
    id: number,
    updateData: Partial<CreateRoundData>
  ): Promise<RoundData | null>;
}
