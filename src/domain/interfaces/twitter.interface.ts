export interface ITwitterService {
  createTweetsForRounds(): Promise<void>;
}

export interface TwitterConfig {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}
