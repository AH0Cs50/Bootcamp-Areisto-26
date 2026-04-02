import { MovieDTO } from './movieDTO.js';
import { MovieMapper } from './mapper.js';
import { Movie } from './movie.js';
import { movieRepository } from './repository.js';

function sendError(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message }));
}

// GET all movies
export async function getAllMovies(req, res) {
  try {
    const dbMovies = await movieRepository.getAll();
    const moviesDto = dbMovies.map(dbMovie => MovieMapper.mapDbToObject(dbMovie, true));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, movies: moviesDto }));
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

// GET movie by ID
export async function getMovieById(req, res, id) {
  if (!id) return sendError(res, 400, 'ID is required');

  try {
    const dbMovie = await movieRepository.getById(Number(id));
    if (!dbMovie) return sendError(res, 404, 'Movie not found');

    const movieDto = MovieMapper.mapDbToObject(dbMovie, true);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, movie: movieDto }));
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

// GET movies by search on title 
export async function getMoviesBySearch(req, res, filter) {
    try {
      const dbMovies = await movieRepository.getAll(filter);
      const moviesDto = dbMovies.map(dbMovie => MovieMapper.mapDbToObject(dbMovie, true));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, movies: moviesDto }));
    } catch (err) {
      sendError(res, 500, err.message);
    }
}

//GET some movies by limit 
export async function getSomeMoviesByLimit (req,res,limit) {
    try {
        const dbMovies = await movieRepository.getByLimit(limit);
        const moviesDto = dbMovies.map(dbMovie => MovieMapper.mapDbToObject(dbMovie, true));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, movies: moviesDto }));
      } catch (err) {
        sendError(res, 500, err.message);
      }
}

// POST create a new movie
export async function createMovie(req, res) {
  if (!req.body) return sendError(res, 400, 'Body data not included');

  try {
    const dto = MovieDTO.create(req.body); // create mode
    const movieEntity = new Movie(MovieMapper.mapDtoToObject(dto));
    movieEntity.id = await movieRepository.getNextId();

    const dbData = MovieMapper.mapDtoToObject(dto, true); // map DTO -> DB
    dbData.id = movieEntity.id;

    const created = await movieRepository.create(dbData);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Movie created',
      data: MovieMapper.mapDbToObject(created, true) // DB -> DTO
    }));
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

// PATCH update movie by ID
export async function updateMovie(req, res, id) {
  if (!id) return sendError(res, 400, 'ID is required');
  if (!req.body) return sendError(res, 400, 'Body data not included');

  try {
    const dto = MovieDTO.create(req.body, true); // update mode
    const patchData = MovieMapper.mapDtoToObject(dto, true); // map only provided fields DTO -> DB

    const updated = await movieRepository.update(Number(id), patchData);
    if (!updated) return sendError(res, 404, 'Movie not found');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Movie ${id} updated`,
      data: MovieMapper.mapDbToObject(updated, true)
    }));
  } catch (err) {
    sendError(res, 400, err.message);
  }
}

// DELETE movie by ID
export async function deleteMovie(req, res, id) {
  if (!id) return sendError(res, 400, 'ID is required');

  try {
    const deleted = await movieRepository.delete(Number(id));
    if (!deleted) return sendError(res, 404, 'Movie not found');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Movie ${id} deleted`,
      data: MovieMapper.mapDbToObject(deleted, true)
    }));
  } catch (err) {
    sendError(res, 500, err.message);
  }
}

export default {
  getAllMovies,
  getMovieById,
  getMoviesBySearch,
  getSomeMoviesByLimit,
  createMovie,
  updateMovie,
  deleteMovie
};