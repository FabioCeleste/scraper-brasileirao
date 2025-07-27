import { IRoundRepository } from '../../data-access/interfaces/round.repository.interface';
import { CreateRoundData, RoundData } from '../entities/round.entity';
import { IRoundService } from '../interfaces/round.interface';

export class RoundService implements IRoundService {
  constructor(private readonly roundRepository: IRoundRepository) {}

  async createRoundIfNotExists(
    roundData: CreateRoundData
  ): Promise<RoundData | null> {
    const exists = await this.roundRepository.existsByNumber(roundData.number);

    if (exists) {
      return null;
    }

    return await this.roundRepository.create(roundData);
  }

  async findById(id: number): Promise<RoundData | null> {
    return await this.roundRepository.findById(id);
  }

  async updateRound(
    id: number,
    updateData: Partial<CreateRoundData>
  ): Promise<RoundData | null> {
    return await this.roundRepository.updateRound(id, updateData);
  }

  async bulkCreateRounds(roundsData: CreateRoundData[]): Promise<{
    created: RoundData[];
    skipped: number;
  }> {
    const created: RoundData[] = [];
    let skipped = 0;

    for (const roundData of roundsData) {
      const result = await this.createRoundIfNotExists(roundData);

      if (result) {
        created.push(result);
      } else {
        skipped++;
      }
    }

    return { created, skipped };
  }

  async findAll(): Promise<RoundData[]> {
    return await this.roundRepository.findAll();
  }
}
