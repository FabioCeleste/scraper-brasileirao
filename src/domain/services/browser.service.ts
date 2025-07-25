import { Browser, BrowserContext, Page, chromium } from 'playwright';

import { ScrapingConfig } from '../entities/scraper.entity';
import { IBrowserService } from '../interfaces/browser.interface';

export class BrowserService implements IBrowserService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private config: ScrapingConfig;

  constructor(config: ScrapingConfig = { headless: true, timeout: 30000 }) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    console.log(
      '🚀 Iniciando browser em modo:',
      this.config.headless ? 'HEADLESS' : 'VISUAL'
    );
    try {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      this.context = await this.browser.newContext({
        userAgent:
          this.config.userAgent ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });

      console.log('Browser iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar browser:', error);
      throw error;
    }
  }

  async newPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context não inicializado');
    }

    const page = await this.context.newPage();
    page.setDefaultTimeout(this.config.timeout);

    return page;
  }

  async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
      }
      if (this.browser) {
        await this.browser.close();
      }
      console.log('Browser fechado com sucesso');
    } catch (error) {
      console.error('Erro ao fechar browser:', error);
    }
  }
}
