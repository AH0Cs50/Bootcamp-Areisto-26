//acts like middleware 
export function collectRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);   // Collect stream chunks
        req.on('end', () => {
            req.body = JSON.parse(body);
            resolve(req.body);
        });// Resolve when finished
        req.on('error', err => reject(err));      // Reject if error occurs
    });
}

import movieController from './controller.js';
import { URL } from 'url';

export async function movieRouter(req, res) {
    const MainRoute = '/api/v1/movies';
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;//to get query string params 

    try {
        // GET all movies or some movies by query param
        if (req.method === 'GET' && pathname === MainRoute) {
            const searchValue = searchParams.get('search');
            const limit = searchParams.get('limit');
            
            if (searchValue){
                return movieController.getMoviesBySearch(req,res,searchValue);
            }else if (limit){
                return movieController.getSomeMoviesByLimit(req,res,limit);
            }

            return movieController.getAllMovies(req, res);
        }

        // GET movie by ID
        if (req.method === 'GET' && pathname.startsWith(MainRoute + '/')) {
            const id = pathname.split('/')[4];
            return movieController.getMovieById(req, res, id);
        }

        // POST create a new movie
        if (req.method === 'POST' && pathname === MainRoute) {
            await collectRequestBody(req); // parses JSON into req.body
            return movieController.createMovie(req, res);
        }

        // PATCH update movie
        if (req.method === 'PATCH' && pathname.startsWith(MainRoute + '/')) {
            const id = pathname.split('/')[4];
            await collectRequestBody(req);
            return movieController.updateMovie(req, res, id);
        }

        // DELETE movie
        if (req.method === 'DELETE' && pathname.startsWith(MainRoute + '/')) {
            const id = pathname.split('/')[4];
            return movieController.deleteMovie(req, res, id);
        }

        // Route not found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err.message }));
    }
}