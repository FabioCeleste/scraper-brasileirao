import { TeamData } from './team.entity';

export interface MatchData {
  id: number;
  round: number;
  roundId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  status: string;
  tweetId: string | null;
}

export interface CreateMatchData {
  round: number;
  roundId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  status: string;
  tweetId: string | null;
}

export interface MatchDataWithTeams extends MatchData {
  homeTeam: TeamData;
  awayTeam: TeamData;
}

export interface PlayerData {
  id: number;
  name: string;
  teamId: number;
}

export interface GoalData {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
  minute: number;
  player?: PlayerData;
  team?: TeamData;
}

export interface CardData {
  id: number;
  matchId: number;
  playerId: number;
  teamId: number;
  type: CardType;
  minute: number;
  player?: PlayerData;
  team?: TeamData;
}

export interface StatisticData {
  id: number;
  type: string;
  teamId?: number;
  playerId?: number;
  value: number;
  team?: TeamData;
  player?: PlayerData;
}

export enum Matchestatus {
  SCHEDULED = 'scheduled',
  FINISHED = 'finished',
  POSTPONED = 'postponed',
}

export enum CardType {
  YELLOW = 'yellow',
  RED = 'red',
}
