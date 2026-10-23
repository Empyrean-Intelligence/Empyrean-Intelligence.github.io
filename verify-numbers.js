const fs = require('fs');
const path = require('path');

const allowedNumbers = new Set([
  '0.2', '0.1', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  '16', '45', '50', '57', '147', '155', '169', '353', '400', '413', '415', '466', '942',
  '1000', '1,000', '17.9', '15.6', '20.5', '13.8', '10.8', '17.5', '10.3', '6.5', '16.1',
  '9.7', '7.3', '12.7', '3.4', '1.5', '7.7', '2.0', '1.0', '4.0', '95.2', '84.6', '95',
  '0.7100', '0.6900', '0.6200', '0.3100', '0.001', '0.400', '0.050', '0', '0%'
]);

const files = [
  'index.html',
  'tools/gameability.html',
  'tools/rsi-audit.html',
  'method.html'
];

let totalErrors = 0;

files.forEach(f => {
  const p = path.join(__dirname, f);
  const text = fs.readFileSync(p, 'utf8');
  
  // Remove styles, scripts, html tags, attributes
  const clean = text
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    .replace(/href="[^"]*"/gi, '')
    .replace(/<[^>]+>/g, ' ');

  // Extract all numbers including formatted numbers like 1,000
  const matches = clean.match(/\b\d{1,3}(,\d{3})*(\.\d+)?%?\b/g) || [];
  console.log('Checking ' + f + ' (found ' + matches.length + ' numbers)...');
  
  const unexpected = [];
  matches.forEach(m => {
    const raw = m.replace('%', '');
    if (!allowedNumbers.has(m) && !allowedNumbers.has(raw)) {
      unexpected.push(m);
    }
  });

  if (unexpected.length === 0) {
    console.log('  -> PASS: All numbers are in allowed list.');
  } else {
    console.log('  -> UNEXPECTED NUMBERS:', unexpected);
    totalErrors += unexpected.length;
  }
});

if (totalErrors === 0) {
  console.log('\nSUCCESS: 100% of numbers across all pages strictly match the prompt specifications!');
} else {
  console.log('\nFAILED: ' + totalErrors + ' unexpected number(s) found.');
  process.exit(1);
}
