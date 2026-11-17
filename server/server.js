
/* =========================================
   ПРАКТИКУМ 14. NODE.JS HTTP-СЕРВЕР
   ПРАКТИКУМ 15. БЕЗПЕКА ЗАСТОСУНКУ
   Варіант 4. Каталог настільних ігор
========================================= */

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const games = require('./games.json');

const PORT = 3000;
const ROOT = path.resolve(__dirname, '..');

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Відправлення JSON-відповіді
function sendJSON(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8'
    });

    res.end(JSON.stringify(data, null, 2));
}

// Створення HTTP-сервера
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const pathname = url.pathname;

    /* =========================================
       ПРАКТИКУМ 15. ЗАХИСНІ HTTP-ЗАГОЛОВКИ
    ========================================= */

    // Заборона визначення MIME-типу браузером
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Заборона вбудовування сторінки в iframe
    res.setHeader('X-Frame-Options', 'DENY');

    // Обмеження передачі адреси переходу
    res.setHeader(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
    );

    // Обмеження джерел скриптів, стилів і зображень
    res.setHeader(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' https://unpkg.com 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data:",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-ancestors 'none'"
        ].join('; ')
    );

    /* =========================================
       API З ПРАКТИКУМУ 14
    ========================================= */

    // Дозволяємо лише GET-запити
    if (req.method !== 'GET') {
        sendJSON(res, 405, {
            error: 'Метод не підтримується'
        });
        return;
    }

    // GET /api/games — увесь каталог ігор
    if (pathname === '/api/games') {
        sendJSON(res, 200, games);
        return;
    }

    // GET /api/games/:id — одна конкретна гра
    const gameRoute = pathname.match(/^\/api\/games\/(\d+)$/);

    if (gameRoute) {
        const id = Number(gameRoute[1]);

        const game = games.find(item => item.id === id);

        if (game) {
            sendJSON(res, 200, game);
        } else {
            sendJSON(res, 404, {
                error: 'Гру не знайдено'
            });
        }

        return;
    }

    // Невідомий маршрут API
    if (pathname.startsWith('/api/')) {
        sendJSON(res, 404, {
            error: 'Маршрут API не знайдено'
        });
        return;
    }

    /* =========================================
       СТАТИЧНІ ФАЙЛИ ЗАСТОСУНКУ
    ========================================= */

    const relative = pathname === '/'
        ? 'index.html'
        : pathname.slice(1);

    const allowed =
        ['index.html', 'script.js', 'router.js']
            .includes(relative) ||
        /^(css|assets|js)\//.test(relative);

    const filePath = path.resolve(ROOT, relative);

    // Не дозволяємо звертатися до сторонніх файлів
    if (
        !allowed ||
        !filePath.startsWith(ROOT + path.sep)
    ) {
        sendJSON(res, 404, {
            error: 'Файл не знайдено'
        });
        return;
    }

    try {
        const content = await fs.readFile(filePath);

        const extension = path.extname(filePath)
            .toLowerCase();

        res.writeHead(200, {
            'Content-Type':
                TYPES[extension] ||
                'application/octet-stream'
        });

        res.end(content);

    } catch (error) {
        sendJSON(res, 404, {
            error: 'Файл не знайдено'
        });
    }
});

// Запуск локального сервера
server.listen(PORT, '127.0.0.1', () => {
    console.log(
        `Сервер запущено: http://127.0.0.1:${PORT}`
    );

    console.log(
        `API: http://127.0.0.1:${PORT}/api/games`
    );

    console.log(
        'Практикум 15: захисні HTTP-заголовки увімкнено'
    );
});
