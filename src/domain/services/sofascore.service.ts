import { Page } from 'playwright';

import { MatchData, MatchDataWithTeams } from '../entities/match.entity';
import { ScrapedMatch, ScrapingConfig } from '../entities/scraper.entity';
import { IMatcheservice } from '../interfaces/match.interface';
import { IRoundService } from '../interfaces/round.interface';
import { ISofascoreService } from '../interfaces/sofascore.interface';
import { ITeamService } from '../interfaces/team.interface';

import { BrowserService } from './browser.service';

export class SofaScoreScraperService implements ISofascoreService {
  private browserService: BrowserService;
  private page: Page | null = null;
  private readonly baseUrl =
    'https://www.sofascore.com/pt/torneio/futebol/brazil/brasileirao-serie-a/325#id:72034';

  constructor(
    private readonly roundService: IRoundService,
    private readonly teamService: ITeamService,
    private readonly matcheservice: IMatcheservice,
    config?: ScrapingConfig
  ) {
    this.browserService = new BrowserService(config);
  }

  async initialize(): Promise<void> {
    try {
      console.log('Inicializando SofaScore Scraper...');
      await this.browserService.initialize();
      this.page = await this.browserService.newPage();

      await this.navigateToPage();

      console.log('Scraper inicializado e página carregada');
    } catch (error) {
      console.error('Erro ao inicializar scraper:', error);
      throw error;
    }
  }

  async scrapeMatches(): Promise<MatchData[]> {
    if (!this.page) {
      throw new Error('Scraper não inicializado');
    }

    console.log('Iniciando scraping dos jogos...');

    try {
      const rounds = await this.roundService.findAll();

      for (const activeRound of rounds) {
        await this.goToRound(activeRound.number);
        const roundMatches = await this.getMatchesFromActiveRound();
        const roundMatchesFormated = this.removeDuplicateMatches(roundMatches);
        console.log(
          roundMatchesFormated.length,
          '--partidas carregadas para a rodada ' + activeRound
        );

        roundMatchesFormated.map(async activeMatch => {
          const homeTeamData = await this.teamService.findByName(
            activeMatch.homeTeamName
          );

          const awayTeamData = await this.teamService.findByName(
            activeMatch.awayTeamName
          );

          if (!homeTeamData || !awayTeamData) {
            return;
          }

          const activeMatchSave =
            await this.matcheservice.findMatchByHomeAndAwayTeams(
              activeMatch.homeTeamName,
              activeMatch.awayTeamName
            );

          if (activeMatchSave) {
            await this.matcheservice.updateMatch(activeMatchSave.id, {
              round: activeRound.number,
              roundId: activeRound.id,
              homeTeamId: homeTeamData.id,
              homeScore: activeMatch.homeTeamScore
                ? parseInt(activeMatch.homeTeamScore)
                : null,
              awayTeamId: awayTeamData.id,
              awayScore: activeMatch.awayTeamScore
                ? parseInt(activeMatch.awayTeamScore)
                : null,
              date: activeMatch.date,
              time: activeMatch.date,
              status: activeMatch.Matchestatus,
              tweetId: null,
            });
          } else {
            await this.matcheservice.create({
              round: activeRound.number,
              roundId: activeRound.id,
              homeTeamId: homeTeamData.id,
              homeScore: activeMatch.homeTeamScore
                ? parseInt(activeMatch.homeTeamScore)
                : null,
              awayTeamId: awayTeamData.id,
              awayScore: activeMatch.awayTeamScore
                ? parseInt(activeMatch.awayTeamScore)
                : null,
              date: activeMatch.date,
              time: activeMatch.date,
              status: activeMatch.Matchestatus,
              tweetId: null,
            });
          }
        });
        console.log('✅ Rodada ' + activeRound.number + ' carregado');
      }

      return [];
    } catch (error) {
      console.error('Erro durante scraping:', error);
      throw error;
    }
  }

  async updatePostponedMatches(): Promise<void> {
    if (!this.page) {
      throw new Error('Scraper não inicializado');
    }

    const postponedMatches =
      await this.matcheservice.findMatchByStatus('postponed');

    const matchesByRound: { [roundNumber: number]: MatchDataWithTeams[] } = {};

    postponedMatches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    const roundsWithNumbers: Array<{
      round: number;
      matches: MatchDataWithTeams[];
    }> = Object.entries(matchesByRound).map(([roundNumber, matches]) => ({
      round: parseInt(roundNumber),
      matches: matches,
    }));

    for (const roundWithMatches of roundsWithNumbers) {
      try {
        await this.goToRound(roundWithMatches.round);

        const scrapedMatches = await this.getMatchesFromActiveRound();

        for (const match of roundWithMatches.matches) {
          const updatedScrapedMatches = scrapedMatches.filter(scrapedMatch => {
            return (
              scrapedMatch.homeTeamName === match.homeTeam.name &&
              scrapedMatch.awayTeamName === match.awayTeam.name
            );
          });

          updatedScrapedMatches.map(async match => {
            const savedMatch =
              await this.matcheservice.findMatchByHomeAndAwayTeams(
                match.homeTeamName,
                match.awayTeamName
              );

            // TODO create tweet when update database
            if (match.homeTeamScore && match.awayTeamScore && savedMatch) {
              const updateMatch = await this.matcheservice.updateMatch(
                savedMatch.id,
                {
                  awayScore: parseInt(match.awayTeamScore),
                  homeScore: parseInt(match.homeTeamScore),
                  status: 'finished',
                }
              );

              console.log(
                `${match.homeTeamName} ${updateMatch?.homeScore} X ${updateMatch?.awayScore} ${match.awayTeamName}`
              );
            }
          });
        }
      } catch (error) {
        console.log('ERROR na rodada:', roundWithMatches.round, error);
      }
    }

    console.log('Partidas com número da rodada:', roundsWithNumbers);
  }

  async updateMatchesByRound(roundNumber: number): Promise<void> {
    if (!this.page) {
      throw new Error('Scraper não inicializado');
    }

    console.log(`Atualizando jogos da rodada ${roundNumber}...`);

    try {
      await this.goToRound(roundNumber);

      const scrapedMatches = await this.getMatchesFromActiveRound();
      const roundMatchesFormatted = this.removeDuplicateMatches(scrapedMatches);

      console.log(
        `${roundMatchesFormatted.length} partidas encontradas na rodada ${roundNumber}`
      );

      for (const scrapedMatch of roundMatchesFormatted) {
        try {
          const savedMatch =
            await this.matcheservice.findMatchByHomeAndAwayTeams(
              scrapedMatch.homeTeamName,
              scrapedMatch.awayTeamName
            );

          if (!savedMatch) {
            console.log(
              `⚠️ Jogo não encontrado no banco: ${scrapedMatch.homeTeamName} vs ${scrapedMatch.awayTeamName}`
            );
            continue;
          }

          const updateData: any = {
            status: scrapedMatch.Matchestatus,
          };

          if (scrapedMatch.homeTeamScore && scrapedMatch.awayTeamScore) {
            updateData.homeScore = parseInt(scrapedMatch.homeTeamScore);
            updateData.awayScore = parseInt(scrapedMatch.awayTeamScore);
          }

          const updatedMatch = await this.matcheservice.updateMatch(
            savedMatch.id,
            updateData
          );

          if (scrapedMatch.Matchestatus === 'finished') {
            // TODO add tweet when match is finished
            console.log(scrapedMatch);
          }

          if (updatedMatch) {
            console.log(
              `✅ Jogo atualizado: ${scrapedMatch.homeTeamName} ${updatedMatch.homeScore ?? '-'} X ${updatedMatch.awayScore ?? '-'} ${scrapedMatch.awayTeamName} [${updatedMatch.status}]`
            );
          }
        } catch (error) {
          console.error(
            `❌ Erro ao atualizar jogo ${scrapedMatch.homeTeamName} vs ${scrapedMatch.awayTeamName}:`,
            error
          );
        }
      }

      console.log(`✅ Rodada ${roundNumber} atualizada com sucesso`);
    } catch (error) {
      console.error(`❌ Erro ao atualizar rodada ${roundNumber}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('Fechando scraper...');
    await this.browserService.close();
  }

  private async navigateToPage(): Promise<void> {
    if (!this.page) {
      throw new Error('Página não inicializada');
    }

    console.log(`Navegando para: ${this.baseUrl}`);

    try {
      await this.page.goto(this.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      await this.waitForPageLoad();

      console.log('Página carregada com sucesso');
    } catch (error) {
      console.error('Erro ao navegar para a página:', error);
      throw error;
    }
  }

  private async waitForPageLoad(): Promise<void> {
    try {
      await this.page!.waitForSelector('[data-panelid="round"]', {
        timeout: 10000,
        state: 'visible',
      });

      const allTeams = await this.teamService.findAll();
      const teamsName: string[] = allTeams.map(team => team.name || '');

      console.log(`${teamsName.length} times carregados`);

      await this.page!.waitForTimeout(2000);

      const { visibleTeams } = await this.page!.$$eval(
        '[data-panelid="round"] a[data-id]',
        elements => {
          const foundTeams = new Set<string>();
          const allTeamsFromPage: string[] = [];

          elements.forEach(element => {
            try {
              const teamImages = element.querySelectorAll('img[alt]');
              const homeTeamName = teamImages[0]?.alt?.trim() || '';
              const awayTeamName = teamImages[1]?.alt?.trim() || '';

              if (homeTeamName) {
                foundTeams.add(homeTeamName);
                allTeamsFromPage.push(homeTeamName);
              }
              if (awayTeamName) {
                foundTeams.add(awayTeamName);
                allTeamsFromPage.push(awayTeamName);
              }
            } catch (err) {
              console.error('Erro ao processar elemento:', err);
            }
          });

          return {
            visibleTeams: Array.from(foundTeams),
            allFoundTeams: allTeamsFromPage,
          };
        },
        teamsName
      );

      const missingTeams = teamsName.filter(expectedTeam => {
        if (visibleTeams.includes(expectedTeam)) return false;

        const normalizedExpected = expectedTeam
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[-\s]+/g, ' ')
          .trim()
          .toLowerCase();

        const foundNormalized = visibleTeams.some(
          visibleTeam =>
            visibleTeam
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[-\s]+/g, ' ')
              .trim()
              .toLowerCase() === normalizedExpected
        );

        return !foundNormalized;
      });

      if (missingTeams.length > 0) {
        console.log(
          `⚠️ Times não encontrados na tela: ${missingTeams.join(', ')}`
        );
        console.log(
          `✅ Times encontrados: ${visibleTeams.length - missingTeams.length}/${teamsName.length}`
        );

        missingTeams.forEach(missingTeam => {
          const suggestions = visibleTeams.filter(
            visibleTeam =>
              visibleTeam
                .toLowerCase()
                .includes(missingTeam.toLowerCase().split(' ')[0]) ||
              missingTeam
                .toLowerCase()
                .includes(visibleTeam.toLowerCase().split(' ')[0])
          );
          if (suggestions.length > 0) {
            console.log(
              `💡 Possível correspondência para "${missingTeam}": ${suggestions.join(', ')}`
            );
          }
        });
      } else {
        console.log(
          `✅ Todos os ${teamsName.length} times estão visíveis na tela`
        );
      }

      console.log('✅ Elementos da página carregados');
    } catch (error) {
      console.log('⚠️ Elementos não encontrados, continuando...', error);
      await this.page!.waitForTimeout(3000);
    }
  }

  private async goToRound(roundNumber: number): Promise<void> {
    try {
      const parentElement = await this.page!.waitForSelector(
        '[data-panelid="round"]',
        {
          timeout: 10000,
          state: 'visible',
        }
      );

      const childElements = await parentElement.$$('.DropdownButton');

      if (childElements[0]) {
        await childElements[0].click();
      }

      const roundRegex = new RegExp(`^Rodada ${roundNumber}$`);

      const roundOption = this.page!.locator('li[role="option"]').filter({
        hasText: roundRegex,
      });

      if (roundOption) {
        await roundOption.click();
      }

      await this.waitForPageLoad();
    } catch {
      console.log(`⚠️ Erro para abrir rodada ${roundNumber}, continuando...`);
    }
  }

  private async getMatchesFromActiveRound(): Promise<ScrapedMatch[]> {
    const matches = await this.page!.$$eval(
      '[data-panelid="round"] a[data-id]',
      elements => {
        return elements
          .map(element => {
            try {
              const teamImages = element.querySelectorAll('img[alt]');
              const homeTeamName = teamImages[0]?.alt || '';
              const awayTeamName = teamImages[1]?.alt || '';

              const scoreBoxes = element.querySelectorAll(
                '.score-box .currentScore'
              );
              let homeTeamScore = '';
              let awayTeamScore = '';

              if (scoreBoxes.length >= 2) {
                const scores = Array.from(scoreBoxes as any)
                  .map(el => (el as any).textContent?.trim())
                  .filter(score => score && /^\d+$/.test(score));

                if (scores.length >= 2) {
                  homeTeamScore = scores[0];
                  awayTeamScore = scores[1];
                }
              }
              let Matchestatus = 'scheduled';
              let date = '';

              const allText = element.textContent || '';

              if (allText.includes('Adiado')) {
                Matchestatus = 'postponed';
                const timeMatch = allText.match(/(\d{1,2}:\d{2})/);
                date = timeMatch ? timeMatch[1] : '';
              } else if (
                allText.includes('F2°T') ||
                allText.includes('Finalizado')
              ) {
                Matchestatus = 'finished';
                const timeMatch = allText.match(/(\d{1,2}:\d{2})/);
                date = timeMatch ? timeMatch[1] : '';
              } else {
                Matchestatus = 'scheduled';
                const dateMatch = allText.match(/(\d{2}\/\d{2}\/\d{2})/);
                const timeMatch = allText.match(/(\d{1,2}:\d{2})/);

                const dateText = dateMatch ? dateMatch[1] : '';
                const timeText = timeMatch ? timeMatch[1] : '';
                date = `${dateText} ${timeText}`.trim();
              }

              return {
                homeTeamName,
                awayTeamName,
                homeTeamScore,
                awayTeamScore,
                Matchestatus,
                date,
              };
            } catch (err) {
              console.error('Erro ao processar elemento:', err);
              return null;
            }
          })
          .filter(match => match !== null);
      }
    );

    return matches;
  }

  private removeDuplicateMatches(matches: ScrapedMatch[]): ScrapedMatch[] {
    return Array.from(
      matches
        .reduce((map, match) => {
          const key = `${match.homeTeamName}-${match.awayTeamName}-${match.date}`;
          const existing = map.get(key);

          if (!existing) {
            map.set(key, match);
          } else {
            const matchHasScores = match.homeTeamScore && match.awayTeamScore;
            const existingHasScores =
              existing.homeTeamScore && existing.awayTeamScore;

            if (matchHasScores && !existingHasScores) {
              map.set(key, match);
            }
          }

          return map;
        }, new Map<string, ScrapedMatch>())
        .values()
    );
  }
}
