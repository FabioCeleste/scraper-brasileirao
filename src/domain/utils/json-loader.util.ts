import { readFileSync } from 'fs';
import { join } from 'path';

import { CreateRoundData } from '../entities/round.entity';
import { CreateTeamData } from '../entities/team.entity';

export class JsonLoader {
  static loadTeamsFromJson(filePath: string): CreateTeamData[] {
    try {
      const fullPath = join(process.cwd(), 'src', 'assets', 'data', filePath);
      console.log(fullPath);

      const jsonData = readFileSync(fullPath, 'utf-8');
      const teams = JSON.parse(jsonData);

      if (!Array.isArray(teams)) {
        throw new Error('O arquivo JSON deve conter um array de times');
      }

      return teams.map((team: any) => {
        return team;
      });
    } catch (error: any) {
      throw new Error(`Erro ao carregar arquivo JSON: ${error.message}`);
    }
  }

  static loadRoundsFromJson(filePath: string): CreateRoundData[] {
    try {
      const fullPath = join(process.cwd(), 'src', 'assets', 'data', filePath);
      console.log(fullPath);

      const jsonData = readFileSync(fullPath, 'utf-8');
      const rounds = JSON.parse(jsonData);

      if (!Array.isArray(rounds)) {
        throw new Error('O arquivo JSON deve conter um array de rodadas');
      }

      return rounds.map((round: any) => {
        return round;
      });
    } catch (error: any) {
      throw new Error(`Erro ao carregar arquivo JSON: ${error.message}`);
    }
  }
}
