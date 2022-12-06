# toxic-plant-list-scraper
[![Run scraper](https://github.com/fourthclasshonours/toxic-plant-list-scraper/actions/workflows/run.yml/badge.svg)](https://github.com/fourthclasshonours/toxic-plant-list-scraper/actions/workflows/run.yml)

Script to scrape list of toxic plants from [ASPCA](https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants)

### Development
1. Run `yarn install`
2. Run `docker-compose up` to spin up an instance of PostgreSQL (main data store) and Redis (for OneMap caching)
3. Run `yarn dev:scrape` to start the scraper. In non-production environments, this will launch Chromium.
  Adjust `scraper.ts` accordingly for testing purposes (e.g. disable other sources in order to save time)
