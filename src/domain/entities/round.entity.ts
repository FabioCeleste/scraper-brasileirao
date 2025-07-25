export interface RoundData {
  id: number;
  number: number;
  startDate: string;
  tweetId?: string | null;
}

export interface CreateRoundData {
  number: number;
  startDate: string;
  tweetId?: string | null;
}
