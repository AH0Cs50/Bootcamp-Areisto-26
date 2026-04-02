import db from './db.js';

export const movieRepository = {

    // Load all movies (from memory or file)
    async getAll(search) {
        if (!db.movies.length) await db.read(); // load if memory is empty
        if (search) {
            const searchLower = search.toLowerCase();
            return db.movies.filter(movie =>
                movie.title && movie.title.toLowerCase().includes(searchLower)
            );
        }
        return db.movies;
    },

    //get some movies based on limit
    async getByLimit(limit){
        if (!db.movies.length) await db.read();
        return db.movies.slice (0,Number(limit));
    },

    // Get a movie by ID
    async getById(id) {
        if (!db.movies.length) await db.read();
        return db.movies.find(m => m.id === id) || null;
    },

    // Create a new movie
    async create(movie) {
        if (!db.movies.length) await db.read();
        db.movies.push(movie);      // add to memory
        await db.write();           // persist
        return movie;
    },

    // Update a movie by ID
    async update(id, data) {
        if (!db.movies.length) await db.read();
        const index = db.movies.findIndex(m => m.id === id);
        if (index === -1) return null; // not found
        const old_data = db.movies[index];
        db.movies[index] = { ...old_data, ...data }; // new data object overwrite the old
        await db.write(); // save changes
        return db.movies[index];
    },

    // Delete a movie by ID
    async delete(id) {
        if (!db.movies.length) await db.read();
        const index = db.movies.findIndex(m => m.id === id);
        if (index === -1) return null; 
        const deleted = db.movies.splice(index, 1)[0];
        await db.write();
        return deleted;
    },

    async getLastId() {
        if (db.meta === null) {
            await db.readMeta();
        }

        return db.meta.last_id ?? 0;
    },

    async getNextId() {
        if (db.meta === null) await db.readMeta();
        const nextId = (db.meta.last_id ?? 0) + 1;
        db.meta.last_id = nextId;
        await db.writeMeta();

        return nextId;
    },
};