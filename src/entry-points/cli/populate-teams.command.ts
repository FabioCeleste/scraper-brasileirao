import { PrismaClient } from '@prisma/client';

import { TeamRepository } from '../../data-access/repositories/team.repository';
import { TeamService } from '../../domain/services/team.service';
import { JsonLoader } from '../../domain/utils/json-loader.util';

export class PopulateTeamsCommand {
  private readonly prisma = new PrismaClient();
  private readonly teamRepository = new TeamRepository(this.prisma);
  private readonly teamService = new TeamService(this.teamRepository);

  async execute(jsonFileName: string = 'teams2025.json'): Promise<void> {
    try {
      console.log('🏁 Iniciando população de times...');

      const teamsData = JsonLoader.loadTeamsFromJson(jsonFileName);
      console.log(`📋 ${teamsData.length} times encontrados no arquivo JSON`);

      const result = await this.teamService.bulkCreateTeams(teamsData);

      console.log(`✅ ${result.created.length} times criados`);
      console.log(`⏭️ ${result.skipped} times já existiam (pulados)`);

      if (result.created.length > 0) {
        console.log('\n📝 Times criados:');
        result.created.forEach(team => {
          console.log(`  - ${team.name} (${team.acronym})`);
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao popular times:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}
