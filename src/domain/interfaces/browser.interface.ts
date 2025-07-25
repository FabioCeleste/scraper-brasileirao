import { Page } from 'playwright';

export interface IBrowserService {
  initialize(): Promise<void>;
  newPage(): Promise<Page>;
  close(): Promise<void>;
}
