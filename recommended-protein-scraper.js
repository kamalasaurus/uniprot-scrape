import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// 403 FORBIDDEN
// DON'T WASTE YOUR TIME
// TAIR BANS ROBOTS

export default async function recscraper() {

  //  https://www.arabidopsis.org/locus?name=AT5G08080
  //  https://www.uniprot.org/uniprotkb/Q8VZU2/entry
  //  https://rest.uniprot.org/uniprotkb/Q8VZU2.fasta

  // Array.from(document.querySelectorAll('a')).map(a => a.href).filter(l => /protein\?key/.test(l)).pop()
  // document.querySelectorAll("a[href*=protein\\?key]")[0].href

  // #__BVID__211 > tbody > tr > td:nth-child(1) > div
  // document.querySelectorAll('a[href*=uniprot]')[0].href

  const output = await Deno.open("./data/recommended-protein-sequences.tsv", {
    write: true,
    create: true,
    append: true
  })
  
  const logger = output.writable.getWriter()

  const encoder = new TextEncoder()

  const txt = await Deno.readTextFile('./set-sequences/gene-list.tsv')
  const genes = txt.split('\n').filter(Boolean)

  const browser = await puppeteer.launch({
    // executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  for (const gene of genes) {
    try {
      const url =  `https://www.arabidopsis.org/locus?name=${gene}`

      const page = await browser.newPage()
      await page.setViewport({width: 1080, height: 1024})
      await page.goto(url);

      const link = 'a[href*=protein\\?key]'

      await page.screenshot({path: 'screenshot.png'});

      // const textToFind = " Sequences ";
      // const xpathExpression = `//a[text()='${textToFind}']`;
      
      // const elements = await page.$x(xpathExpression);
      
      // await elements[0].click();

      await page.waitForSelector(link)

      console.log('hello')

      linkSelector = await page.$(link)

      const href = await page.evaluate(selector => {
        return selector.href
      }, linkSelector)
      
      await linkSelector.dispose();

      console.log('yeet')

      let uniprot_name = ''

      // Navigate to the href if it exists
      if (href) {
        await page.goto(href);

        console.log('crap')

        const prot = 'a[href*=uniprot]'
        await page.waitForSelector(prot)

        protSelector = await page.$(prot)

        uniprot_name = await page.evaluate(selector => {
          return selector.href
        }, protSelector)
 
        console.log('success')

        await protSelector.dispose();
      }

      const line = `${gene}\t${href}\t${uniprot_name}`

      await logger.write(encoder.encode(`${line}\n`))

      console.log(line)
      await page.close()
    } catch (error) {
      console.error(error)
      console.error(line)
      await page.close()
    }
   }

  await browser.close()
  await logger.close()
}