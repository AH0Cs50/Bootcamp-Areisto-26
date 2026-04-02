import http from 'http';

import {movieRouter} from './router.js';

const Server = http.createServer((req,res)=>{
    movieRouter(req,res);
});

Server.listen(5500,()=>{
    console.log("server start listen on port 5500");
});
