import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export default async function compscraper() {
  const output = await Deno.open("./data/comprehensive-protein-sequences.tsv", {
    write: true,
    create: true,
    append: true
  })
  
  const logger = output.writable.getWriter()

  const encoder = new TextEncoder()

  const txt = await Deno.readTextFile('./AGI2uniprot.txt')
  const gene_to_protein = txt.split('\n')
    .filter(Boolean)
    .map(line => Object.fromEntries(
      line
        .split('\t')
        .map((e, i) => i === 0 ? ['key', e] : ['value', e])
    ))
    .reduce((acc, k_v) => (
      acc[k_v.key] ?
        acc[k_v.key].push(k_v.value) :
        acc[k_v.key] = [k_v.value],
        acc
    ), {})

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  for (const gene of Object.keys(gene_to_protein)) {
    for (const protein of gene_to_protein[gene]) {
      try {
        const url =  `https://rest.uniprot.org/uniprotkb/${protein}.fasta`

        const page = await browser.newPage()
        await page.setViewport({width: 1080, height: 1024})
        await page.goto(url)

        const body = 'body'
        await page.waitForSelector(body)

        const selectorHandle = await page.$(body)
        const [heading, ...seq] = await page.evaluate((body) => {
          return body
            .textContent
            .trim()
            .split(/\n/)
        }, selectorHandle)
        await selectorHandle.dispose();

        const header = heading.split('').toSpliced(1, 0, `${gene} `).join('')
        const sequence = seq.join('')

        await logger.write(encoder.encode(`${header}\n${sequence}\n`))

        console.log(gene, protein, sequence)
        await page.close()
      } catch (error) {
        console.error(gene, protein, error)
        await page.close()
      }
    }
  }

  await browser.close()
  await logger.close()
}