import { ITeamRepository } from '../../data-access/interfaces/team.repository.interface';
import { CreateTeamData, TeamData } from '../entities/team.entity';
import { ITeamService } from '../interfaces/team.interface';

export class TeamService implements ITeamService {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async findByShortname(shortName: string): Promise<TeamData | null> {
    return await this.teamRepository.findByShortname(shortName);
  }

  async findByName(name: string): Promise<TeamData | null> {
    return await this.teamRepository.findByName(name);
  }

  async createTeamIfNotExists(
    teamData: CreateTeamData
  ): Promise<TeamData | null> {
    const exists = await this.teamRepository.existsByNameOrShortname(
      teamData.name,
      teamData.shortname
    );

    if (exists) {
      return null;
    }

    return await this.teamRepository.create(teamData);
  }

  async bulkCreateTeams(teamsData: CreateTeamData[]): Promise<{
    created: TeamData[];
    skipped: number;
  }> {
    const created: TeamData[] = [];
    let skipped = 0;

    for (const teamData of teamsData) {
      const result = await this.createTeamIfNotExists(teamData);

      if (result) {
        created.push(result);
      } else {
        skipped++;
      }
    }

    return { created, skipped };
  }

  async findAll(): Promise<TeamData[]> {
    return await this.teamRepository.findAll();
  }
}
