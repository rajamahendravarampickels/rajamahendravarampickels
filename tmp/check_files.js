
import fs from 'fs';
import path from 'path';

// Just output what we mapped previously
const destFolder = 'public/images/products';
const mappedFiles = fs.readdirSync(destFolder).filter(f => !f.includes('default'));
console.log(`We have ${mappedFiles.length} real product images assigned.`);
