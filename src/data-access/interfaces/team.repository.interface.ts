import { TeamData, CreateTeamData } from '../../domain/entities/team.entity';

export interface ITeamRepository {
  findById(id: number): Promise<TeamData | null>;
  findByName(name: string): Promise<TeamData | null>;
  findByShortname(shortName: string): Promise<TeamData | null>;
  create(teamData: CreateTeamData): Promise<TeamData>;
  findAll(): Promise<TeamData[]>;
  existsByNameOrShortname(name: string, shortName: string): Promise<boolean>;
}
