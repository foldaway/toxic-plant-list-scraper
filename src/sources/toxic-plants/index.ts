import { Browser } from 'puppeteer';
import type { Animal, Plant } from './model';

const PAGE_URLS: Record<Animal, string> = {
  cat: 'https://www.aspca.org/pet-care/animal-poison-control/cats-plant-list',
  dog: 'https://www.aspca.org/pet-care/animal-poison-control/dogs-plant-list',
  horse:
    'https://www.aspca.org/pet-care/animal-poison-control/horse-plant-list',
};

type IncompletePlant = Omit<
  Plant,
  'imageUrl' | 'toxicPrinciples' | 'clinicalSigns'
>;

export default async function toxicPlants(browser: Browser): Promise<Plant[]> {
  const page = await browser.newPage();

  async function scrapeUrl(pageUrl: string): Promise<IncompletePlant[]> {
    await page.goto(pageUrl);

    const incompletePlants: IncompletePlant[] = await page.evaluate(() => {
      const results: IncompletePlant[] = [];

      const viewContentDiv = document.querySelector('.view-content');
      const rows = viewContentDiv.querySelectorAll('.field-content');

      rows.forEach((row) => {
        results.push({
          name: row.querySelector('a').textContent,
          commonNames: row.childNodes[1].textContent
            .match(/\((.*?)\)/)[1]
            .split(', ')
            .filter((name) => typeof name === 'string' && name.length > 0),
          scientificName: row.querySelector('i').textContent,
          family: row.childNodes[7].textContent.trim() || null,
          link: row.querySelector('a').href,
          toxicTo: [],
        });
      });

      return results;
    });

    return incompletePlants;
  }

  const incompletePlantsMap: Record<string, IncompletePlant> = {};

  // Scrape toxic plants for each animal.
  for (const [animal, pageUrl] of Object.entries(PAGE_URLS)) {
    const incompletePlantsForAnimal = await scrapeUrl(pageUrl);

    // Populate the shared map to eliminate duplicate plants.
    incompletePlantsForAnimal.forEach((incompletePlant) => {
      // NOTE: we have to key by name + scientific name as the names are not unique.
      const plantKey = `${incompletePlant.name} ${incompletePlant.scientificName}`;
      if (!(plantKey in incompletePlantsMap)) {
        incompletePlantsMap[plantKey] = incompletePlant;
      }
      incompletePlantsMap[plantKey].toxicTo.push(animal as Animal);
    });
  }

  const plants: Plant[] = [];

  // Scrape remaining properties for each plant.
  for (const incompletePlant of Object.values(incompletePlantsMap)) {
    await page.goto(incompletePlant.link);

    const remainingProperties = await page.evaluate(() => {
      const imageUrl = document.querySelector('img').src;
      return {
        imageUrl: imageUrl.includes('imageunavailable') ? null : imageUrl,
        toxicPrinciples:
          document
            .querySelector('.field-name-field-toxic-principles')
            ?.querySelector('.values')
            .textContent.trim() ?? null,
        clinicalSigns:
          document
            .querySelector('.field-name-field-clinical-signs')
            ?.querySelector('.values')
            .textContent.trim() ?? null,
      };
    });

    plants.push({
      ...incompletePlant,
      ...remainingProperties,
    });
  }

  return plants;
}
