import {
  CreateMatchData,
  MatchData,
  MatchDataWithTeams,
} from '../entities/match.entity';

export interface IMatcheservice {
  findMatchByHomeAndAwayTeams(
    homeTeamName: string,
    awayTeamName: string
  ): Promise<MatchData | null>;
  create(matchData: CreateMatchData): Promise<MatchData | null>;
  findMatchByStatus(
    status: 'finished' | 'scheduled' | 'postponed'
  ): Promise<MatchDataWithTeams[]>;
  updateMatch(
    id: number,
    updateData: Partial<CreateMatchData>
  ): Promise<MatchData | null>;
}
