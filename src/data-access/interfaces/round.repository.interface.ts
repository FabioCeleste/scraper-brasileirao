import { RoundData, CreateRoundData } from '../../domain/entities/round.entity';

export interface IRoundRepository {
  findById(id: number): Promise<RoundData | null>;
  create(roundData: CreateRoundData): Promise<RoundData>;
  findAll(): Promise<RoundData[]>;
  existsByNumber(value: number): Promise<boolean>;
  updateRound(
    id: number,
    updateData: Partial<CreateRoundData>
  ): Promise<RoundData | null>;
}
