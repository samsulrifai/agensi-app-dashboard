const fs = require('fs');
const path = require('path');

const pages = [
  { path: 'admin/projects/page.tsx', title: 'Admin Projects' },
  { path: 'admin/workers/page.tsx', title: 'Admin Workers' },
  { path: 'admin/finance/page.tsx', title: 'Admin Finance' },
  { path: 'admin/reports/page.tsx', title: 'Admin Reports' },
  { path: 'worker/dashboard/page.tsx', title: 'Worker Dashboard' },
  { path: 'worker/projects/page.tsx', title: 'Worker Projects' },
  { path: 'worker/performance/page.tsx', title: 'Worker Performance' },
  { path: 'worker/finance/page.tsx', title: 'Worker Finance' },
];

const basePath = path.join(__dirname, 'src/app/(dashboard)');

for (const page of pages) {
  const filePath = path.join(basePath, page.path);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if <title> already exists
    if (!content.includes('<title>')) {
      // Find the first return statement of the default export
      // Usually looks like: return ( \n <div className="..."
      const match = content.match(/return\s*\(\s*<div[^>]*>/);
      if (match) {
        const replacement = `${match[0]}\n      <title>${page.title}</title>`;
        content = content.replace(match[0], replacement);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${page.path}`);
      } else {
        console.log(`Could not find return statement in ${page.path}`);
      }
    } else {
      console.log(`Title already exists in ${page.path}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
