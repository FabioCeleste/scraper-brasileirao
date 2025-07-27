import { PrismaClient } from '@prisma/client';

import { CreateRoundData, RoundData } from '../../domain/entities/round.entity';
import { IRoundRepository } from '../interfaces/round.repository.interface';

export class RoundRepository implements IRoundRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<RoundData | null> {
    return await this.prisma.round.findFirst({
      where: { id },
    });
  }

  async create(roundData: CreateRoundData): Promise<RoundData> {
    return await this.prisma.round.create({
      data: roundData,
    });
  }

  async updateRound(
    id: number,
    updateData: Partial<CreateRoundData>
  ): Promise<RoundData | null> {
    const existingRound = await this.prisma.round.findUnique({
      where: { id },
    });

    if (!existingRound) {
      return null;
    }

    return await this.prisma.round.update({
      where: { id },
      data: updateData,
    });
  }

  async existsByNumber(value: number): Promise<boolean> {
    const round = await this.prisma.round.findFirst({
      where: {
        number: value,
      },
    });

    return round !== null;
  }

  async findAll(): Promise<RoundData[]> {
    return await this.prisma.round.findMany();
  }
}
