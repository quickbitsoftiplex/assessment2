const { readFile, writeFile } = require('fs/promises');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Reads all items from the JSON file and returns a Promise ( non-blocking ) which resolves them as an array.
async function getAll() {
    const raw = await readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
}
// Returns a Promise ( non-blocking ) that saves the items array to the JSON file.
async function saveAll(items) {
    await writeFile(DATA_PATH, JSON.stringify(items, null, 2));
}

module.exports = { getAll, saveAll };