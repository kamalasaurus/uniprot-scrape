import compscraper from './comprehensive-protein-scraper.js';
import recscraper from './recommended-protein-scraper.js';

async function main() {
  //await compscraper();
  await recscraper();
}

main();