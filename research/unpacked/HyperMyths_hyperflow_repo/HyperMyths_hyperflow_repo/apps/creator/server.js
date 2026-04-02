const http = require('http');
http.createServer((req,res)=>{res.writeHead(200, {'Content-Type':'text/html'});res.end('<h1>HyperMyths creator stub</h1>');}).listen(3002, ()=>console.log('creator on http://localhost:3002'));
