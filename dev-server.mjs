/**
 * Servidor local para desarrollo: archivos estáticos + proxy a la API del challenge.
 * Evita CORS en el navegador (la API no envía Access-Control-Allow-Origin).
 *
 * Uso: node dev-server.mjs
 * Abrir: http://localhost:3000
 */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const API_HOST = 'lerenconsulting.com';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function sendJson(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

function proxyToApi(req, res) {
    const options = {
        hostname: API_HOST,
        path: req.url,
        method: req.method,
        headers: {
            accept: req.headers.accept || 'application/json',
            host: API_HOST,
        },
    };

    const proxyReq = https.request(options, (proxyRes) => {
        const headers = { ...proxyRes.headers };
        headers['access-control-allow-origin'] = '*';
        res.writeHead(proxyRes.statusCode, headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
        sendJson(res, 502, { error: 'No se pudo contactar la API' });
    });

    proxyReq.end();
}

function serveStatic(req, res) {
    let filePath = req.url.split('?')[0];
    if (filePath === '/') filePath = '/index.html';

    const safePath = path.normalize(filePath).replace(/^(\.\.[/\\])+/, '');
    const absolutePath = path.join(__dirname, safePath);

    if (!absolutePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(absolutePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }

        const ext = path.extname(absolutePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/apptiendanube')) {
        proxyToApi(req, res);
        return;
    }
    serveStatic(req, res);
});

server.listen(PORT, () => {
    console.log('Dev server: http://localhost:' + PORT);
    console.log('Proxy API:  http://localhost:' + PORT + '/apptiendanube/...');
});
