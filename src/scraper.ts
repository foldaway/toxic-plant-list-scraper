import 'ts-polyfill/lib/es2019-array';

import puppeteer, { Browser } from 'puppeteer';

import * as Sentry from '@sentry/node';
import { readStore, writeStore } from './output';

import fs from 'fs';

import { ToxicPlants } from './sources/toxic-plants/constants';
import cats from './sources/toxic-plants/cats';
import { Plant } from './sources/toxic-plants/model';

const { NODE_ENV, SENTRY_DSN } = process.env;

const isProduction = NODE_ENV === 'production';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
  });
}

try {
  fs.mkdirSync('traces');
} catch (e) {}

async function toxicPlants(browser: Browser) {
  async function tempFunc(
    toxicPlant: ToxicPlants,
    workFunc: (browser: Browser) => Promise<Plant[]>
  ) {
    try {
      console.log('Scraping: ', toxicPlant);
      const data = await workFunc(browser);

      const store = readStore('toxicPlants.json');
      writeStore('toxicPlants.json', {
        ...store,
        [toxicPlant]: data,
      });
      console.log('Completed: ', toxicPlant);
    } catch (e) {
      console.error(e);
      Sentry?.captureException(e);
    }
  }

  await Promise.all([tempFunc(ToxicPlants.cats, cats)]);
}

async function scraper() {
  const isARMMac = process.arch === 'arm64' && process.platform === 'darwin';

  const browser = await puppeteer.launch({
    headless: isProduction,
    defaultViewport: null,
    args: isProduction ? ['--no-sandbox'] : [],
    executablePath: isARMMac
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined,
  });

  await toxicPlants(browser);

  await browser.close();
}

scraper()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    Sentry?.captureException(e);
    process.exit(1);
  });
