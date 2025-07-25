import { Match } from '../entities/match.entity';

export interface ISofascoreService {
  initialize(): Promise<void>;
  scrapeMatches(): Promise<Match[]>;

  close(): Promise<void>;
}
