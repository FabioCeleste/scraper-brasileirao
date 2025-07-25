import {
  CreateMatchData,
  MatchData,
  MatchDataWithTeams,
} from '../../domain/entities/match.entity';

export interface IMatchRepository {
  findById(id: number): Promise<MatchData | null>;
  findMatchByHomeAndAwayTeams(
    homeTeamName: string,
    awayTeamName: string
  ): Promise<MatchData | null>;
  create(matchData: CreateMatchData): Promise<MatchData>;
  findAll(): Promise<MatchData[]>;
  findMatchByStatus(status: string): Promise<MatchDataWithTeams[]>;
  updateMatch(
    id: number,
    updateData: Partial<CreateMatchData>
  ): Promise<MatchData | null>;
}
