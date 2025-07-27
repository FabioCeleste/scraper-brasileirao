// eslint-disable-next-line
require('dotenv').config();

import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';

import { MatchDataWithTeams } from '../entities/match.entity';
import { RoundData } from '../entities/round.entity';
import { IMatcheservice } from '../interfaces/match.interface';
import { IRoundService } from '../interfaces/round.interface';
import { ITwitterService } from '../interfaces/twitter.interface';
import { TwitterTemplatesUtil } from '../utils/twitter-templates.util';

export class TwitterService implements ITwitterService {
  private readonly client: TwitterApi;
  private readonly rwClient: TwitterApiReadWrite;

  constructor(
    private readonly roundService: IRoundService,
    private readonly matchService: IMatcheservice
  ) {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    } as any);

    this.rwClient = this.client.readWrite;
  }

  async createTweetsForRounds(): Promise<void> {
    const limitPost = 2;
    let activeLimit = 0;

    const rounds = await this.roundService.findAll();

    const orderedRounds = this.sortRoundsByNumber(rounds);

    try {
      for (const round of orderedRounds) {
        if (activeLimit === limitPost) {
          return;
        }

        const roundText = TwitterTemplatesUtil.generateRoundTweet(round.number);

        if (!round.tweetId) {
          const response = await this.rwClient.v2.tweet(roundText);

          await this.roundService.updateRound(round.id, {
            tweetId: response.data.id,
          });
        }

        activeLimit++;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async createTweetForFinishedGames(): Promise<void> {
    const limitPost = 15;
    let activeLimit = 0;

    const matches = await this.matchService.findMatchByStatus('finished');
    const orderedMatchesByRound = this.sortMatchesByRound(matches);

    for (const match of orderedMatchesByRound) {
      if (activeLimit === limitPost) {
        return;
      }

      const round = await this.roundService.findById(match.roundId);

      if (round?.tweetId && !match.tweetId) {
        const matchText = TwitterTemplatesUtil.generateMatchTweet(
          String(match.homeTeam.shortName),
          Number(match.homeScore),
          Number(match.awayScore),
          String(match.awayTeam.shortName)
        );

        console.log(
          String(match.homeTeam.shortName),
          Number(match.homeScore),
          Number(match.awayScore),
          String(match.awayTeam.shortName)
        );

        try {
          const response = await this.rwClient.v2.tweet({
            text: matchText,
            reply: {
              in_reply_to_tweet_id: round.tweetId,
            },
          });

          console.log(
            String(match.homeTeam.shortName),
            Number(match.homeScore),
            Number(match.awayScore),
            String(match.awayTeam.shortName)
          );

          await this.roundService.updateRound(round.id, {
            tweetId: response.data.id,
          });

          await this.matchService.updateMatch(match.id, {
            tweetId: response.data.id,
          });
          activeLimit++;
        } catch (error) {
          console.error(`Erro ao postar tweet para match ${match.id}:`, error);
        }
      }
    }
  }

  private sortRoundsByNumber(rounds: RoundData[]): RoundData[] {
    return rounds.sort((a, b) => a.number - b.number);
  }

  private sortMatchesByRound(
    matches: MatchDataWithTeams[]
  ): MatchDataWithTeams[] {
    // const matchesByRound = matches.reduce(
    //   (acc, match) => {
    //     if (!acc[match.round]) {
    //       acc[match.round] = [];
    //     }
    //     acc[match.round].push(match);
    //     return acc;
    //   },
    //   {} as Record<number, MatchDataWithTeams[]>
    // );

    // const rounds = Object.keys(matchesByRound)
    //   .map(Number)
    //   .sort((a, b) => a - b);

    // const result: MatchDataWithTeams[] = [];
    // const maxMatches = Math.max(
    //   ...Object.values(matchesByRound).map(arr => arr.length)
    // );

    // for (let i = 0; i < maxMatches; i++) {
    //   for (const round of rounds) {
    //     if (matchesByRound[round][i]) {
    //       result.push(matchesByRound[round][i]);
    //     }
    //   }
    // }

    // return result;

    return matches.sort((a, b) => a.round - b.round);
  }
}
