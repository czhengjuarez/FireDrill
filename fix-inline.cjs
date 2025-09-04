const fs = require('fs');

// Read the built files
const cssContent = fs.readFileSync('dist/assets/index-Kj7OrdyV.css', 'utf8');
const jsContent = fs.readFileSync('dist/assets/index-DGW7fwBM.js', 'utf8');

// Create the new inline HTML
const newInlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/svg+xml" href="/favico.svg">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cybersecurity Fire Drill</title>
    <style>
${cssContent}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
${jsContent}
    </script>
</body>
</html>`;

// Read the worker file
let workerContent = fs.readFileSync('workers-site/index.js', 'utf8');

// Find the start and end of the INLINE_HTML constant
const startPattern = /const INLINE_HTML = "/;
const startMatch = workerContent.match(startPattern);
if (!startMatch) {
  console.error('Could not find INLINE_HTML constant');
  process.exit(1);
}

const startIndex = startMatch.index + startMatch[0].length - 1; // Keep the opening quote
let endIndex = -1;
let quoteCount = 0;
let inEscape = false;

// Find the matching closing quote
for (let i = startIndex + 1; i < workerContent.length; i++) {
  const char = workerContent[i];
  
  if (inEscape) {
    inEscape = false;
    continue;
  }
  
  if (char === '\\') {
    inEscape = true;
    continue;
  }
  
  if (char === '"') {
    endIndex = i;
    break;
  }
}

if (endIndex === -1) {
  console.error('Could not find end of INLINE_HTML constant');
  process.exit(1);
}

// Replace the content between the quotes
const beforeQuote = workerContent.substring(0, startIndex + 1);
const afterQuote = workerContent.substring(endIndex);
const escapedHtml = newInlineHtml.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

const updatedWorkerContent = beforeQuote + escapedHtml + afterQuote;

// Write the updated worker file
fs.writeFileSync('workers-site/index.js', updatedWorkerContent);
console.log('✅ Successfully updated INLINE_HTML in worker');
