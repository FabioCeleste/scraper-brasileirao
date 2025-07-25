import { PrismaClient } from '@prisma/client';

import {
  CreateMatchData,
  MatchData,
  MatchDataWithTeams,
} from '../../domain/entities/match.entity';
import { IMatchRepository } from '../interfaces/match.repository.interface';

export class MatchRepository implements IMatchRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<MatchData | null> {
    return await this.prisma.match.findFirst({
      where: { id },
    });
  }

  async findMatchByHomeAndAwayTeams(
    homeTeamName: string,
    awayTeamName: string
  ): Promise<MatchData | null> {
    return await this.prisma.match.findFirst({
      where: {
        homeTeam: { name: homeTeamName },
        awayTeam: { name: awayTeamName },
      },
    });
  }

  async create(matchData: CreateMatchData): Promise<MatchData> {
    return await this.prisma.match.create({
      data: matchData,
    });
  }

  async updateMatch(
    id: number,
    updateData: Partial<CreateMatchData>
  ): Promise<MatchData | null> {
    const existingMatch = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!existingMatch) {
      return null;
    }

    return await this.prisma.match.update({
      where: { id },
      data: updateData,
    });
  }

  async findAll(): Promise<MatchData[]> {
    return await this.prisma.match.findMany();
  }

  async findMatchByStatus(status: string): Promise<MatchDataWithTeams[]> {
    return await this.prisma.match.findMany({
      where: {
        status,
      },
      include: {
        awayTeam: true,
        homeTeam: true,
      },
    });
  }
}
