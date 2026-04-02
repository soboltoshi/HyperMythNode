const http = require('http');
const port = 3000;
http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end('<h1>HyperMyths web stub</h1><p>Local-first assembly is alive.</p>');
}).listen(port, ()=>console.log(`web on http://localhost:${port}`));
