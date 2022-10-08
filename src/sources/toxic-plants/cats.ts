import { Browser } from 'puppeteer';
import type { Plant } from './model';

export default async function cats(browser: Browser): Promise<Plant[]> {
  const page = await browser.newPage();

  await page.goto(
    'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list'
  );

  const plants: Plant[] = await page.evaluate(() => {
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
      };

      results.push(plant);
    });

    return results;
  });

  return plants;
}
