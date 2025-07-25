import { CreateTeamData, TeamData } from '../entities/team.entity';

export interface ITeamService {
  createTeamIfNotExists(teamData: CreateTeamData): Promise<TeamData | null>;
  findByShortname(shortName: string): Promise<TeamData | null>;
  findByName(name: string): Promise<TeamData | null>;
  bulkCreateTeams(teamsData: CreateTeamData[]): Promise<{
    created: TeamData[];
    skipped: number;
  }>;
  findAll(): Promise<TeamData[]>;
}
