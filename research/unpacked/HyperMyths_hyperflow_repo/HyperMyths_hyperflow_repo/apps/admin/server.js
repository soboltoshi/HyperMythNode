const http = require('http');
http.createServer((req,res)=>{res.writeHead(200, {'Content-Type':'text/html'});res.end('<h1>HyperMyths admin stub</h1>');}).listen(3001, ()=>console.log('admin on http://localhost:3001'));
