export interface ScrapingConfig {
  headless: boolean;
  timeout: number;
  userAgent?: string;
}

export interface ScrapedMatch {
  homeTeamName: any;
  awayTeamName: any;
  homeTeamScore: string;
  awayTeamScore: string;
  Matchestatus: string;
  date: string;
}
