const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, 'dist');
const port = Number(process.argv[2] || 4173);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400);res.end();return; }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403);res.end();return; }
  if (file === root) file = path.join(root,'index.html');
  fs.readFile(file,(error,data) => {
    if (error) { res.writeHead(404);res.end('Not found');return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
});
server.on('error', error => {
  console.error('Preview failed: ' + error.code + ' — ' + error.message);
  if (error.code === 'EADDRINUSE') console.error('Port ' + port + ' is already occupied. Close the previous preview window, or run: node preview.cjs 4190');
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  const local = 'http://127.0.0.1:' + port + '/';
  const probe = http.get(local, response => {
    response.resume();
    if (response.statusCode === 200) {
      console.log('Local: ' + local);
      console.log('Self-check: HTTP 200 | Process: ' + process.pid);
      console.log('Keep this window open while viewing the portfolio.');
    } else {
      console.error('Preview self-check failed: HTTP ' + response.statusCode);
      server.close(); process.exitCode = 1;
    }
  });
  probe.setTimeout(3000, () => probe.destroy(new Error('Local self-check timed out')));
  probe.on('error', error => {
    console.error('Preview self-check failed: ' + error.message);
    server.close(); process.exitCode = 1;
  });
});
