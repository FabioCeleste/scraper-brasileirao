export class TwitterTemplatesUtil {
  static generateRoundTweet(roundNumber: number): string {
    return [
      `🇧🇷 Brasileirão 2025 – Rodada ${roundNumber}`,
      '',
      '⚽️ Acompanhe todos os resultados por aqui!',
      '',
      `#Brasileirão #Rodada${roundNumber}`,
    ].join('\n');
  }

  static generateMatchTweet(
    homeTeamName: string,
    homeScore: number,
    awayScore: number,
    awayTeamName: string
  ): string {
    return [
      `${homeTeamName} ${homeScore} x ${awayScore} ${awayTeamName}`,
      '',
      'Resultado final – Brasileirão 2025',
    ].join('\n');
  }
}
