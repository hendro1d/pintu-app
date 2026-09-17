const fs = require('fs');
const b = fs.readFileSync('test.png');
console.log(b.slice(0, 8).toString('hex'));
process.exit(0);
