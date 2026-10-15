import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.min.js',
  'node_modules/html2canvas/dist/npm/css/types/color.js',
  'node_modules/html2canvas/lib/css/types/color.js'
];

for (const file of filesToPatch) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let patched = false;

    // Pattern 1 in unminified
    const target1 = 'throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");';
    if (content.includes(target1)) {
      content = content.replace(target1, 'return (COLORS && COLORS.TRANSPARENT) ? COLORS.TRANSPARENT : 0;');
      patched = true;
    }

    // Pattern 2 in minified
    const target2 = 'throw new Error("Attempting to parse an unsupported color function \\""+';
    if (content.includes(target2)) {
      content = content.replace(/throw new Error\("Attempting to parse an unsupported color function \\""\+[^)]+\);?/g, 'return 0;');
      patched = true;
    }

    // Also support oklch/lab/color by not throwing
    if (patched) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Successfully patched: ${file}`);
    } else {
      console.log(`No patch needed or pattern not matched for: ${file}`);
    }
  }
}
