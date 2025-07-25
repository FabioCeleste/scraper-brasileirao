import { PrismaClient } from '@prisma/client';

import { RoundRepository } from '../../data-access/repositories/round.repository';
import { RoundService } from '../../domain/services/round.service';
import { JsonLoader } from '../../domain/utils/json-loader.util';

export class PopulateRoundsCommand {
  private readonly prisma = new PrismaClient();
  private readonly roundRepository = new RoundRepository(this.prisma);
  private readonly roundService = new RoundService(this.roundRepository);

  async execute(jsonFileName: string = 'rounds2025.json'): Promise<void> {
    try {
      console.log('🏁 Iniciando população de rodadas...');

      const roundsData = JsonLoader.loadRoundsFromJson(jsonFileName);
      console.log(
        `📋 ${roundsData.length} rodadas encontrados no arquivo JSON`
      );

      const result = await this.roundService.bulkCreateRounds(roundsData);

      console.log(`✅ ${result.created.length} rodadas criadas`);
      console.log(`⏭️ ${result.skipped} rodadas já existiam (pulados)`);

      if (result.created.length > 0) {
        console.log('\n📝 Rodadas criadas:');
        result.created.forEach(round => {
          console.log(`  - ${round.number} (${round.startDate})`);
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao popular rodadas:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
