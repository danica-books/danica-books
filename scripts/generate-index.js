const fs = require("fs");
const path = require("path");

// Könyvek mappája
const booksDir = path.join(__dirname, "..", "data", "books");

// Az új index fájl neve (_index.json → CMS nem látja)
const indexFile = path.join(booksDir, "_index.json");

// Beolvassuk a könyv JSON fájlokat, kivéve az indexet
const files = fs.readdirSync(booksDir)
  .filter(f => f.endsWith(".json") && f !== "_index.json");

// Kiírjuk az indexet
fs.writeFileSync(indexFile, JSON.stringify(files, null, 2));

console.log("_index.json frissítve:", files.length, "könyvvel.");
