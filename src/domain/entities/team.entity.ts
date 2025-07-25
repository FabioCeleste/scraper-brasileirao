export interface TeamData {
  id: number;
  name: string;
  shortName?: string | null;
  acronym?: string | null;
}

export interface CreateTeamData {
  name: string;
  shortname: string;
}
