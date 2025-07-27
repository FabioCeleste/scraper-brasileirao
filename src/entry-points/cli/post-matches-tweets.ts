import { PrismaClient } from '@prisma/client';

import { MatchRepository } from '../../data-access/repositories/match.repository';
import { RoundRepository } from '../../data-access/repositories/round.repository';
import { Matcheservice } from '../../domain/services/match.service';
import { RoundService } from '../../domain/services/round.service';
import { TwitterService } from '../../domain/services/twitter.service';

export class PostMatchesTweetsCommand {
  private readonly prisma = new PrismaClient();

  private readonly roundsRepository = new RoundRepository(this.prisma);
  private readonly roundsService = new RoundService(this.roundsRepository);

  private readonly matchRepository = new MatchRepository(this.prisma);
  private readonly matchService = new Matcheservice(this.matchRepository);

  private readonly twitterService = new TwitterService(
    this.roundsService,
    this.matchService
  );

  async execute(): Promise<void> {
    try {
      console.log('🏁 Iniciando criação de tweets para partidas...');

      await this.twitterService.createTweetForFinishedGames();

      console.log('✅ Tweets para partidas criados com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao popular times:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
