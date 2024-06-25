import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export default async function recscraper() {

  //  https://www.arabidopsis.org/locus?name=AT5G08080
  //  https://www.uniprot.org/uniprotkb/Q8VZU2/entry
  //  https://rest.uniprot.org/uniprotkb/Q8VZU2.fasta

  // Array.from(document.querySelectorAll('a')).map(a => a.href).filter(l => /protein\?key/.test(l)).pop()
  // document.querySelectorAll("a[href*=protein\\?key]")[0].href

  // #__BVID__211 > tbody > tr > td:nth-child(1) > div
  // document.querySelectorAll('a[href*=uniprot]')[0].href

  const output = await Deno.open("./data/recommended-protein-sequences.fasta", {
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
    try {
      const url =  `https://www.arabidopsis.org/locus?name=${gene}`

      const page = await browser.newPage()
      await page.setViewport({width: 1080, height: 1024})
      await page.goto(url, { waitUntil: 'networkidle0' });

      const linkSelector = 'a[href*=protein\\?key]'

      const href = await page.evaluate(selector => {
        const element = document.querySelector(selector);
        return element ? element.href : '';
      }, linkSelector)
      
      let uniprot_name = ''

      // Navigate to the href if it exists
      if (href) {
        await page.goto(href, { waitUntil: 'networkidle0' });

        const protSelector = 'a[href*=uniprot]'

        uniprot_name = await page.evaluate(selector => {
          const element = document.querySelector(selector);
          return element ? element.href : '';
        }, protSelector)
      }

      const line = `${gene}\t${href}\t${uniprot_name}`

      await logger.write(encoder.encode(`${line}\n`))

      console.log(line)
      await page.close()
    } catch (error) {
      console.error(line)
      await page.close()
    }
   }

  await browser.close()
  await logger.close()
}