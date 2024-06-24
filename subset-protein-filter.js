function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export default async function subset() {
  const input = await Deno.readTextFile("./data/comprehensive-protein-sequences.tsv")

  const output = await Deno.open("./set-sequences/gene-list.tsv", {
    write: true,
    create: true,
    append: true
  })
  
  const logger = output.writable.getWriter()

  const encoder = new TextEncoder()

  let files = await Array.fromAsync(Deno.readDir(`./set-edges`))
  let genes = (await Promise.all(files
    .filter(f => !f.name.match(/effector/))
    .map(f => `./set-edges/${f.name}`)
    .map(Deno.readTextFile)
  )).map(f => f.split('\n').map(l => l.split('\t')[0]))
  .flat()
  .filter(Boolean)

  // it's a lot faster to use grep via bash than to use js's regex engine
  for (const gene of genes) {
    await logger.write(encoder.encode(`${gene}\n`))
  }

  // for (const gene of genes) {
  //   const escapedGene = escapeRegExp(gene);
  //   const regex = new RegExp(`.*${escapedGene}.*\n.*`, "g");
    
  //   const matches = input.match(regex);
    
  //   if (matches) {
  //     matches.forEach(async (match) => {
  //       console.log(match);
        // await logger.write(encoder.encode(`${header}\n${sequence}\n`))
      // });
    // }
  // }

  await logger.close()
}