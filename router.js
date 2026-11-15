
/* =========================================
   ПРАКТИКУМ 13. SPA ТА HASH-МАРШРУТИЗАЦІЯ
   Варіант 4. Каталог настільних ігор
========================================= */

const homeView = document.querySelector('#home-view');
const routeView = document.querySelector('#route-view');

// Таблиця маршрутів із параметром :id
const routes = [
    { path: '/', view: renderHome },
    { path: '/owned', view: renderOwned },
    { path: '/games/:id', view: renderGameDetails }
];

// Порівняння адреси з маршрутами
function matchRoute(path) {
    const parts = path.split('/').filter(Boolean);

    for (const route of routes) {
        const pattern = route.path.split('/').filter(Boolean);

        if (pattern.length !== parts.length) {
            continue;
        }

        const params = {};

        const match = pattern.every((part, index) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = parts[index];
                return true;
            }

            return part === parts[index];
        });

        if (match) {
            return {
                view: route.view,
                params
            };
        }
    }

    return null;
}

// Створення DOM-елемента
function element(tag, text, className = '') {
    const node = document.createElement(tag);

    if (text !== undefined) {
        node.textContent = text;
    }

    if (className) {
        node.className = className;
    }

    return node;
}

// Створення внутрішнього посилання
function link(text, hash) {
    const a = element(
        'a',
        text,
        'game-genre spa-link'
    );

    a.href = hash;
    a.dataset.link = '';

    return a;
}

// Спільний рендер картки гри
function gameCard(game) {
    const card = element(
        'article',
        undefined,
        'card spa-card'
    );

    card.append(element('h3', game.title));

    if (game.image) {
        const img = element('img');

        img.src = game.image;
        img.alt = game.alt || game.title;

        card.append(img);
    }

    card.append(element(
        'p',
        `Гравців: ${
            game.players ||
            `${game.minPlayers}-${game.maxPlayers}`
        }`
    ));

    card.append(element(
        'p',
        `Тривалість: ${
            game.duration
                ? game.duration + ' хв'
                : 'не вказано'
        }`
    ));

    card.append(element(
        'p',
        game.owned
            ? 'У моїй колекції'
            : 'Не в колекції'
    ));

    card.append(link(
        'Деталі гри',
        `#/games/${game.id}`
    ));

    return card;
}

/* =========================================
   МАРШРУТ "/"
========================================= */

// Відображення головного каталогу
function renderHome() {
    homeView.hidden = false;
    routeView.hidden = true;
    routeView.replaceChildren();
}

/* =========================================
   МАРШРУТ "/owned"
========================================= */

// Відображення ігор з особистої колекції
async function renderOwned() {
    const page = element('div');

    page.append(element('h2', 'Моя колекція'));

    page.append(link('Усі ігри', '#/'));

    // Дані беремо з IndexedDB
    const games = (await getAllGamesFromDB())
        .filter(game => game.owned === true);

    if (games.length === 0) {
        page.append(element(
            'p',
            'У колекції поки немає ігор. ' +
            'Відкрий деталі гри та додай її.'
        ));

        return page;
    }

    const list = element(
        'div',
        undefined,
        'cards spa-cards'
    );

    games.forEach(game => {
        list.append(gameCard(game));
    });

    page.append(list);

    return page;
}

// Оновлення реактивних даних після запису в IndexedDB
function syncGame(game) {
    const current = vueApp.games.find(
        item => item.id === game.id
    );

    if (current) {
        Object.assign(current, game);
    }

    saveToLocalStorage(vueApp.games);
}

/* =========================================
   МАРШРУТ "/games/:id"
========================================= */

// Детальна сторінка конкретної гри
async function renderGameDetails({ id }) {
    const games = await getAllGamesFromDB();

    const game = games.find(
        item => item.id === Number(id)
    );

    if (!game) {
        return renderNotFound();
    }

    const page = element('div');

    page.append(element(
        'h2',
        `Деталі гри: ${game.title}`
    ));

    page.append(link(
        'Назад до каталогу',
        '#/'
    ));

    // Повторно використовуємо функцію рендеру картки
    const card = gameCard(game);

    // Прибираємо посилання на саму себе
    card.querySelector('.spa-link').remove();

    card.append(element(
        'p',
        `Статус: ${
            game.played ? 'Зіграно' : 'Не зіграно'
        }`
    ));

    page.append(card);

    // Додавання або видалення з колекції
    const ownedButton = element(
        'button',
        game.owned
            ? 'Прибрати з колекції'
            : 'Додати до колекції',
        'btn-filter spa-action'
    );

    ownedButton.type = 'button';

    ownedButton.addEventListener('click', async () => {
        ownedButton.disabled = true;

        try {
            const updated = {
                ...game,
                owned: !game.owned
            };

            await putGameToDB(updated);

            syncGame(updated);

            await renderRoute();

        } catch (error) {
            console.error(
                'Помилка збереження колекції:',
                error
            );

            alert('Не вдалося оновити колекцію');
            ownedButton.disabled = false;
        }
    });

    page.append(ownedButton);

    // Редагування тривалості гри
    const editor = element(
        'div',
        undefined,
        'spa-edit'
    );

    const label = element(
        'label',
        'Тривалість гри (хв):'
    );

    const input = element('input');

    input.type = 'number';
    input.min = '1';
    input.value = game.duration ?? '';

    label.append(input);

    const saveButton = element(
        'button',
        'Зберегти тривалість',
        'btn-filter'
    );

    saveButton.type = 'button';

    saveButton.addEventListener('click', async () => {
        const value = input.value.trim();

        const duration = value === ''
            ? null
            : Number(value);

        if (
            duration !== null &&
            (!Number.isInteger(duration) || duration < 1)
        ) {
            alert(
                'Вкажіть коректну тривалість у хвилинах'
            );

            return;
        }

        saveButton.disabled = true;

        try {
            const updated = {
                ...game,
                duration
            };

            await putGameToDB(updated);

            syncGame(updated);

            await renderRoute();

        } catch (error) {
            console.error(
                'Помилка збереження тривалості:',
                error
            );

            alert(
                'Не вдалося зберегти тривалість'
            );

            saveButton.disabled = false;
        }
    });

    editor.append(label, saveButton);
    page.append(editor);

    return page;
}

/* =========================================
   СТОРІНКА 404
========================================= */

function renderNotFound() {
    const page = element('div');

    page.append(element(
        'h2',
        '404 — Сторінку не знайдено'
    ));

    page.append(link(
        'Повернутися до каталогу',
        '#/'
    ));

    return page;
}

/* =========================================
   ГОЛОВНА ФУНКЦІЯ МАРШРУТИЗАЦІЇ
========================================= */

let navigationVersion = 0;

async function renderRoute() {
    const version = ++navigationVersion;

    const path = location.hash.slice(1) || '/';

    const route = matchRoute(path);

    // Головна сторінка
    if (route?.view === renderHome) {
        renderHome();
        return;
    }

    homeView.hidden = true;
    routeView.hidden = false;

    routeView.replaceChildren(element(
        'p',
        'Завантаження...'
    ));

    try {
        const page = route
            ? await route.view(route.params)
            : renderNotFound();

        // Захист від застарілого результату
        if (version === navigationVersion) {
            routeView.replaceChildren(page);
        }

    } catch (error) {
        console.error(
            'Помилка маршрутизації:',
            error
        );

        if (version === navigationVersion) {
            routeView.replaceChildren(element(
                'p',
                'Не вдалося завантажити сторінку'
            ));
        }
    }
}

/* =========================================
   ПОСИЛАННЯ "ДЕТАЛІ ГРИ" В VUE-КАРТКАХ
========================================= */

const gameList = document.querySelector('#games-list');

// Додаємо посилання до існуючих та нових карток
function addDetailLinks() {
    gameList
        .querySelectorAll('article.card[data-game-id]')
        .forEach(card => {
            if (card.querySelector('[data-game-details]')) {
                return;
            }

            const details = link(
                'Деталі гри',
                `#/games/${card.dataset.gameId}`
            );

            details.dataset.gameDetails = '';

            card.append(details);
        });
}

// Відстежуємо появу нових Vue-карток
new MutationObserver(addDetailLinks).observe(
    gameList,
    {
        childList: true,
        subtree: true
    }
);

Vue.nextTick(addDetailLinks);

/* =========================================
   КЛІЄНТСЬКА НАВІГАЦІЯ
========================================= */

// Перехоплюємо переходи за внутрішніми посиланнями
document.addEventListener('click', event => {
    const a = event.target.closest('a[data-link]');

    if (!a) {
        return;
    }

    event.preventDefault();

    const target = a.getAttribute('href');

    if (location.hash === target) {
        renderRoute();
    } else {
        location.hash = target;
    }
});

// Назад та вперед у браузері
window.addEventListener('hashchange', renderRoute);

// Початковий запуск маршрутизатора
renderRoute();
