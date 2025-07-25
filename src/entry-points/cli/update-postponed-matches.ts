import { PrismaClient } from '@prisma/client';

import { MatchRepository } from '../../data-access/repositories/match.repository';
import { RoundRepository } from '../../data-access/repositories/round.repository';
import { TeamRepository } from '../../data-access/repositories/team.repository';
import { Matcheservice } from '../../domain/services/match.service';
import { RoundService } from '../../domain/services/round.service';
import { SofaScoreScraperService } from '../../domain/services/sofascore.service';
import { TeamService } from '../../domain/services/team.service';

export class UpdatePostponedMatchesCommand {
  private sofaScoreService: SofaScoreScraperService;
  private readonly prisma = new PrismaClient();

  private readonly roundRepository = new RoundRepository(this.prisma);
  private readonly teamRepository = new TeamRepository(this.prisma);
  private readonly matchRepository = new MatchRepository(this.prisma);

  private readonly roundService = new RoundService(this.roundRepository);
  private readonly teamService = new TeamService(this.teamRepository);
  private readonly matcheservice = new Matcheservice(this.matchRepository);

  constructor() {
    this.sofaScoreService = new SofaScoreScraperService(
      this.roundService,
      this.teamService,
      this.matcheservice,
      {
        headless: false,
        timeout: 30000,
      }
    );
  }

  async execute(): Promise<void> {
    try {
      console.log('🏁 Iniciando atualização de partidas atrasadas...');

      await this.sofaScoreService.initialize();

      await this.sofaScoreService.updatePostponedMatches();

      console.log('✅ XX partidas atrasadas atualizadas');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar partidas atrasadas:', error.message);
      throw error;
    } finally {
      await this.sofaScoreService.close();
      await this.prisma.$disconnect();
    }
  }
}
