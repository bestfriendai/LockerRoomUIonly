const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const directory = process.argv[2] || '.';

function fixImports(currentDir) {
  fs.readdir(currentDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${currentDir}`);
      return;
    }

    files.forEach(file => {
      const fullPath = path.join(currentDir, file.name);
      if (file.isDirectory()) {
        fixImports(fullPath);
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
        fs.readFile(fullPath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${fullPath}`);
            return;
          }

          const relativePath = path.relative(rootDir, fullPath);
          const depth = relativePath.split(path.sep).length - 1;
          const prefix = '../'.repeat(depth);

          const lines = data.split('\n');
          const newLines = lines.map(line => {
            if (line.includes('@/')) {
              return line.replace('@/', prefix);
            }
            return line;
          });

          const newData = newLines.join('\n');
          if (newData !== data) {
            fs.writeFile(fullPath, newData, 'utf8', err => {
              if (err) {
                console.error(`Error writing file: ${fullPath}`);
              } else {
                console.log(`Fixed imports in: ${fullPath}`);
              }
            });
          }
        });
      }
    });
  });
}

fixImports(directory);