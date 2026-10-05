// Throwaway UI exploration. Run: node apps/web/prototype/server.mjs
import http from 'node:http';
import {readFile} from 'node:fs/promises';
if (process.env.NODE_ENV === 'production') {
  console.error('This throwaway prototype runs in development only.');
  process.exit(1);
}
const prototypeHtmlUrl = new URL(
  './search-ui.prototype.html',
  import.meta.requestUrl,
);
const prototypeServer = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.requestUrl, 'http://localhost');
  if (
    requestUrl.pathname === '/' ||
    requestUrl.pathname === '/prototype/search-ui'
  ) {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(
      (await readFile(prototypeHtmlUrl, 'utf8')).replace(
        '__PROTOTYPE_DEV__',
        'true',
      ),
    );
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
prototypeServer.listen(4320, '127.0.0.1', () =>
  console.log(
    'AEKI UI prototype: http://127.0.0.1:4320/prototype/search-ui?variant=A',
  ),
);
