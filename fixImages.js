import fs from 'fs';

const data = JSON.parse(fs.readFileSync('listings.json', 'utf-8'));

const fixed = data.map(doc => {
  if (doc.image) {
    doc.images = doc.image;
    delete doc.image;
  }
  return doc;
});

fs.writeFileSync('listings_fixed.json', JSON.stringify(fixed, null, 2));
console.log('Converted all "image" fields to "images" in listings_fixed.json');