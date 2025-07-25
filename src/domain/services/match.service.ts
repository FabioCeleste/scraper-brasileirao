import { IMatchRepository } from '../../data-access/interfaces/match.repository.interface';
import {
  CreateMatchData,
  MatchData,
  MatchDataWithTeams,
} from '../entities/match.entity';
import { IMatcheservice } from '../interfaces/match.interface';

export class Matcheservice implements IMatcheservice {
  constructor(private readonly matchRepository: IMatchRepository) {}

  async findMatchByHomeAndAwayTeams(
    homeTeamName: string,
    awayTeamName: string
  ): Promise<MatchData | null> {
    return await this.matchRepository.findMatchByHomeAndAwayTeams(
      homeTeamName,
      awayTeamName
    );
  }

  async create(matchData: CreateMatchData): Promise<MatchData | null> {
    return await this.matchRepository.create(matchData);
  }

  async findMatchByStatus(
    status: 'finished' | 'scheduled' | 'postponed'
  ): Promise<MatchDataWithTeams[]> {
    return await this.matchRepository.findMatchByStatus(status);
  }

  async updateMatch(
    id: number,
    updateData: Partial<CreateMatchData>
  ): Promise<MatchData | null> {
    return await this.matchRepository.updateMatch(id, updateData);
  }
}
