import { Command } from 'commander';

import { GetAllSofascoreMatches } from './entry-points/cli/get-all-sofascore.command';
import { PopulateRoundsCommand } from './entry-points/cli/populate-rounds.command';
import { PopulateTeamsCommand } from './entry-points/cli/populate-teams.command';
import { UpdatePostponedMatchesCommand } from './entry-points/cli/update-postponed-matches';
import { UpdateMatchesByRoundCLI } from './entry-points/cli/update-round-by-number';

const program = new Command();

program
  .name('brasileirao-cli')
  .description('CLI para gerenciar dados do Brasileirão')
  .version('1.0.0');

program
  .command('populate-teams')
  .description('Popular times no banco de dados')
  .action(async () => {
    try {
      console.log('🏈 Iniciando população de times...');
      const teamsCommand = new PopulateTeamsCommand();
      await teamsCommand.execute();
      console.log('✅ Times populados com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao popular times:', error);
      process.exit(1);
    }
  });

program
  .command('populate-rounds')
  .description('Popular rodadas no banco de dados')
  .action(async () => {
    try {
      console.log('🏁 Iniciando população de rodadas...');
      const roundsCommand = new PopulateRoundsCommand();
      await roundsCommand.execute();
      console.log('✅ Rodadas populadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao popular rodadas:', error);
      process.exit(1);
    }
  });

program
  .command('get-sofascore-matches')
  .description('Buscar todas as partidas do SofaScore')
  .action(async () => {
    try {
      console.log('⚽ Iniciando busca de partidas do SofaScore...');
      const command = new GetAllSofascoreMatches();
      await command.execute();
      console.log('✅ Partidas do SofaScore obtidas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao buscar partidas:', error);
      process.exit(1);
    }
  });

program
  .command('update-postponed')
  .description('Atualizar partidas adiadas')
  .action(async () => {
    try {
      console.log('⏰ Iniciando atualização de partidas adiadas...');
      const command = new UpdatePostponedMatchesCommand();
      await command.execute();
      console.log('✅ Partidas adiadas atualizadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar partidas adiadas:', error);
      process.exit(1);
    }
  });

program
  .command('setup-all')
  .description('Executar todos os comandos de configuração')
  .action(async () => {
    try {
      console.log('🚀 Iniciando configuração completa...');

      const teamsCommand = new PopulateTeamsCommand();
      await teamsCommand.execute();
      console.log('✅ Times populados!');

      const roundsCommand = new PopulateRoundsCommand();
      await roundsCommand.execute();
      console.log('✅ Rodadas populadas!');

      const sofascoreCommand = new GetAllSofascoreMatches();
      await sofascoreCommand.execute();
      console.log('✅ Partidas do SofaScore obtidas!');

      console.log('🎉 Configuração completa finalizada!');
    } catch (error) {
      console.error('❌ Erro na configuração:', error);
      process.exit(1);
    }
  });

program
  .command('update-round')
  .description('Atualizar jogos de uma rodada específica')
  .argument('<round>', 'Número da rodada para atualizar')
  .action(async (roundNumber: string) => {
    try {
      const round = parseInt(roundNumber);

      if (isNaN(round) || round < 1 || round > 38) {
        console.error(
          '❌ Número da rodada inválido. Use um número entre 1 e 38.'
        );
        process.exit(1);
      }

      console.log(`🔄 Iniciando atualização da rodada ${round}...`);
      const command = new UpdateMatchesByRoundCLI();
      await command.executeWithRound(round);
      console.log(`✅ Rodada ${round} atualizada com sucesso!`);
    } catch (error) {
      console.error('❌ Erro ao atualizar rodada:', error);
      process.exit(1);
    }
  });

program.parse();
