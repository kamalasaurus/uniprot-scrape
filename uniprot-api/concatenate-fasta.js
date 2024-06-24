// Function to read and process the FASTA file
async function processFastaFile(filePath) {
  // Read the file content
  const data = await Deno.readTextFile(filePath);
  
  // Split the file content by lines
  const lines = data.split(/\r?\n/);
  let result = '';
  let sequenceLines = '';

  lines.forEach((line) => {
    if (line.startsWith('>')) {
      // If it's a header line and there's a sequence accumulated, add it to the result
      if (sequenceLines) {
        result += sequenceLines + '\n';
        sequenceLines = ''; // Reset the sequence accumulator
      }
      result += line + '\n'; // Add the header line to the result
    } else {
      // Accumulate sequence lines
      sequenceLines += line;
    }
  });

  // Don't forget to add the last sequence if the file doesn't end with a header
  if (sequenceLines) {
    result += sequenceLines + '\n';
  }

  // Here you can either return the result, print it, or save it to a file
  // console.log(result);
  // Optionally, save the result to a new file
  await Deno.writeTextFile('processed_fasta.fasta', result);
}

// Path to the FASTA file
const fastaFilePath = './hyaloperonospora_arabidopsidis.fasta';

// Call the function with the path to the FASTA file
processFastaFile(fastaFilePath).catch(console.error);