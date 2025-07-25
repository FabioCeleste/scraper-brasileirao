import { PrismaClient } from '@prisma/client';

import { CreateTeamData, TeamData } from '../../domain/entities/team.entity';
import { ITeamRepository } from '../interfaces/team.repository.interface';

export class TeamRepository implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<TeamData | null> {
    return await this.prisma.team.findFirst({
      where: { id },
    });
  }

  async findByName(name: string): Promise<TeamData | null> {
    return await this.prisma.team.findFirst({
      where: { name },
    });
  }

  async findByShortname(shortName: string): Promise<TeamData | null> {
    return await this.prisma.team.findFirst({
      where: { shortName },
    });
  }

  async existsByNameOrShortname(
    name: string,
    shortName: string
  ): Promise<boolean> {
    const team = await this.prisma.team.findFirst({
      where: {
        OR: [{ name }, { shortName }],
      },
    });

    return team !== null;
  }

  async create(teamData: CreateTeamData): Promise<TeamData> {
    return await this.prisma.team.create({
      data: teamData,
    });
  }

  async findAll(): Promise<TeamData[]> {
    return await this.prisma.team.findMany();
  }
}
