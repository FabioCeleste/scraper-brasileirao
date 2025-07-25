import { PrismaClient } from '@prisma/client';

import { MatchRepository } from '../../data-access/repositories/match.repository';
import { RoundRepository } from '../../data-access/repositories/round.repository';
import { TeamRepository } from '../../data-access/repositories/team.repository';
import { Matcheservice } from '../../domain/services/match.service';
import { RoundService } from '../../domain/services/round.service';
import { SofaScoreScraperService } from '../../domain/services/sofascore.service';
import { TeamService } from '../../domain/services/team.service';

export class UpdateMatchesByRoundCLI {
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
      const roundNumber = this.getRoundNumberFromArgs();

      if (!roundNumber) {
        console.error('❌ Número da rodada não fornecido.');
        console.log('💡 Uso: npm run update-round -- --round=15');
        console.log('💡 Ou: node dist/cli/update-round.js --round=15');
        return;
      }

      console.log(`🚀 Iniciando atualização da rodada ${roundNumber}...`);

      await this.sofaScoreService.initialize();
      await this.sofaScoreService.updateMatchesByRound(roundNumber);

      console.log(`✅ Rodada ${roundNumber} atualizada com sucesso!`);
    } catch (error) {
      console.error('❌ Erro durante execução:', error);
    } finally {
      await this.sofaScoreService.close();
      await this.prisma.$disconnect();
    }
  }

  async executeWithRound(roundNumber: number): Promise<void> {
    try {
      console.log(`🚀 Iniciando atualização da rodada ${roundNumber}...`);

      await this.sofaScoreService.initialize();
      await this.sofaScoreService.updateMatchesByRound(roundNumber);

      console.log(`✅ Rodada ${roundNumber} atualizada com sucesso!`);
    } catch (error) {
      console.error('❌ Erro durante execução:', error);
      throw error;
    } finally {
      await this.sofaScoreService.close();
      await this.prisma.$disconnect();
    }
  }

  private getRoundNumberFromArgs(): number | null {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--round=')) {
        const roundStr = arg.split('=')[1];
        const roundNum = parseInt(roundStr);
        return isNaN(roundNum) ? null : roundNum;
      }

      if (arg === '--round' && i + 1 < args.length) {
        const roundNum = parseInt(args[i + 1]);
        return isNaN(roundNum) ? null : roundNum;
      }
    }

    return null;
  }
}
