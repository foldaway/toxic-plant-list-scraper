import { Browser } from 'puppeteer';
import type { Animal, Plant } from './model';

const PAGE_URLS: Record<Animal, string> = {
  cat: 'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list',
  dog: 'https://www.aspca.org/pet-care/animal-poison-control/dogs-plant-list',
  horse:
    'https://www.aspca.org/pet-care/animal-poison-control/horse-plant-list',
};

export default async function cats(browser: Browser): Promise<Plant[]> {
  const page = await browser.newPage();

  async function scrapeUrl(pageUrl: string): Promise<Plant[]> {
    await page.goto(pageUrl);

    return await page.evaluate(() => {
      const viewContentDiv = document.querySelector('.view-content');

      const results = [];
      viewContentDiv.querySelectorAll('.field-content').forEach((row) => {
        const commonNames = row.childNodes[1].textContent
          .match(/\((.*?)\)/)[1]
          .split(', ')
          .filter((name) => typeof name === 'string' && name.length > 0);

        const plant: Plant = {
          name: row.querySelector('a').textContent,
          commonNames,
          scientificName: row.querySelector('i').textContent,
          family: row.childNodes[7].textContent.trim() || null,
          link: row.querySelector('a').href,
          toxicTo: [],
        };

        results.push(plant);
      });

      return results;
    });
  }

  const plantsMap: Record<string, Plant> = {};

  for (const [animal, pageUrl] of Object.entries(PAGE_URLS)) {
    const plants = await scrapeUrl(pageUrl);

    plants.forEach((plant) => {
      if (!(plant.name in plantsMap)) {
        plantsMap[plant.name] = plant;
      }
      plantsMap[plant.name].toxicTo.push(animal as Animal);
    });
  }

  return Object.values(plantsMap);
}
