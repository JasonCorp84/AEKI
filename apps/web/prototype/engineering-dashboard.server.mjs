// Throwaway read-only dashboard; no production application integration.
import http from 'node:http';
import {readFile} from 'node:fs/promises';

if (process.env.NODE_ENV === 'production') {
  throw new Error('This prototype is development-only.');
}
const repositoryRoot = new URL('../../../', import.meta.url);
const routes = new Map([
  [
    '/prototype/engineering-dashboard',
    ['engineering-dashboard.prototype.html', 'text/html'],
  ],
  [
    '/dashboard-data.json',
    ['engineering-dashboard.snapshot.json', 'application/json'],
  ],
]);
http
  .createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const route = routes.get(pathname);
    if (route) {
      response.writeHead(200, {
        'Content-Type': `${route[1]}; charset=utf-8`,
        'Cache-Control': 'no-store',
      });
      response.end(await readFile(new URL(route[0], import.meta.url)));
      return;
    }
    if (
      pathname.startsWith('/docs/') &&
      !pathname.includes('..') &&
      pathname.endsWith('.md')
    ) {
      try {
        response.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
        response.end(await readFile(new URL(`.${pathname}`, repositoryRoot)));
      } catch {
        response.end('Evidence file unavailable.');
      }
      return;
    }
    response.writeHead(404);
    response.end('Not found');
  })
  .listen(4321, '127.0.0.1', () => {
    console.log(
      'Dashboard prototype: http://127.0.0.1:4321/prototype/engineering-dashboard?variant=A',
    );
  });
