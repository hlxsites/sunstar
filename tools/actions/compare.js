/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const process = require('process');

function isDifferent(folder1, folder2) {
  let different = false;
  const entries1 = fs.readdirSync(folder1);
  const entries2 = fs.readdirSync(folder2);

  // Check if the number of entries is different
  if (entries1.length !== entries2.length) {
    return true;
  }

  // Check if the names of entries are different
  const sortedEntries1 = entries1.sort();
  const sortedEntries2 = entries2.sort();
  for (let i = 0; i < sortedEntries1.length; i += 1) {
    if (sortedEntries1[i] !== sortedEntries2[i]) {
      return true;
    }
  }

  for (let i = 0; i < sortedEntries1.length; i += 1) {
    const filePath1 = path.join(folder1, sortedEntries1[i]);
    const filePath2 = path.join(folder2, sortedEntries1[i]);

    if (fs.statSync(filePath1).isFile() && fs.statSync(filePath2).isFile()) {
      const content1 = fs.readFileSync(filePath1, 'utf8');
      const content2 = fs.readFileSync(filePath2, 'utf8');

      if (content1 !== content2) {
        different = true;
      }
    } else if (fs.statSync(filePath1).isDirectory() && fs.statSync(filePath2).isDirectory()) {
      different = isDifferent(filePath1, filePath2);
    } else {
      different = true;
    }
    if (different) { break; }
  }
  return different;
}
try {
  const mappingFilePath = process.argv[2];
  if (!mappingFilePath) {
    console.error('Please provide the path to the config JSON file as a command line argument.');
    process.exit(1);
  }
  const mappings = JSON.parse(fs.readFileSync(mappingFilePath, 'utf8'));
  const comparisonResults = [];

  mappings.forEach((mapping) => {
    const result = isDifferent(mapping.source, mapping.target);
    if (result) {
      comparisonResults.push(`### :small_orange_diamond: Difference detected between \`${mapping.source}\` and \`${mapping.target}\`
      \n#### Execute this to fix the difference: \n \`npm run copy ${mapping.source} ext-libs ${mapping.target.split('/').pop()}\`\n`);
    }
  });

  if (comparisonResults.length > 0) {
    fs.writeFileSync('difference_results.md', comparisonResults.join('\n'));
    console.log('Comparison results have been written to difference_results.md');
  } else {
    fs.writeFileSync('difference_results.md', '### :tada: No external libs differences detected :tada:');
    console.log('No differences detected');
  }
} catch (error) {
  fs.writeFileSync('difference_results.md', 'Error reading or processing the JSON file');
  console.error('Error reading or processing the JSON file:', error.message);
}
