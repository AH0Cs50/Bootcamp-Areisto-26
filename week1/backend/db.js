import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function filePath(fileName) {
    return path.join(__dirname, 'assets', fileName);
}

const dbFile = 'movies-db.json';
const metaFile = 'meta.json';

// helpers
async function readFile(fileName) {
    try {
        const data = await fs.readFile(filePath(fileName), 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.log('error in reading:',err);
        throw err;
    }
}

async function writeFile(fileName, data) {
    try {
        await fs.writeFile(
            filePath(fileName),
            JSON.stringify(data, null, 2),
            'utf-8'
        );
    } catch (err) {
        console.error('Error writing file:', err);
        throw err;
    }
}


const db = {
    movies: [],
    meta: null,

    async read() {
        this.movies = await readFile(dbFile);
        return this.movies;
    },

    async write() {
        await writeFile(dbFile, this.movies);
    },

    async readMeta() {
        this.meta = await readFile(metaFile);
        return this.meta;
    },

    async writeMeta() {
        await writeFile(metaFile, this.meta);
    }
};

export default db;