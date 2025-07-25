import { PrismaClient } from '@prisma/client';

import { MatchRepository } from '../../data-access/repositories/match.repository';
import { RoundRepository } from '../../data-access/repositories/round.repository';
import { TeamRepository } from '../../data-access/repositories/team.repository';
import { Matcheservice } from '../../domain/services/match.service';
import { RoundService } from '../../domain/services/round.service';
import { SofaScoreScraperService } from '../../domain/services/sofascore.service';
import { TeamService } from '../../domain/services/team.service';

export class GetAllSofascoreMatches {
  private sofaScoreService: SofaScoreScraperService;
  private readonly prisma = new PrismaClient();

  private readonly roundRepository = new RoundRepository(this.prisma);
  private readonly teamRepository = new TeamRepository(this.prisma);
  private readonly matchRepository = new MatchRepository(this.prisma);

  private readonly roundService = new RoundService(this.roundRepository);
  private readonly teamService = new TeamService(this.teamRepository);
  private readonly Matcheservice = new Matcheservice(this.matchRepository);

  constructor() {
    this.sofaScoreService = new SofaScoreScraperService(
      this.roundService,
      this.teamService,
      this.Matcheservice,
      {
        headless: false,
        timeout: 30000,
      }
    );
  }

  async execute(): Promise<void> {
    try {
      console.log('🚀 Iniciando scraping do SofaScore...');

      await this.sofaScoreService.initialize();
      const matches = await this.sofaScoreService.scrapeMatches();

      console.log(`✅ Scraping concluído. ${matches.length} jogos encontrados`);
    } catch (error) {
      console.error('❌ Erro durante execução:', error);
    } finally {
      await this.sofaScoreService.close();
      await this.prisma.$disconnect();
    }
  }
}
