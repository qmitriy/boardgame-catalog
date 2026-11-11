
console.log('script.js підключено');

const API_URL = 'https://jsonplaceholder.typicode.com/todos?userId=1';

/* =========================================
   ПРАКТИКУМ 11. LOCAL STORAGE
========================================= */

const STORAGE_KEY = 'boardgameCatalogGames';

// Зберігаємо масив ігор у localStorage
function saveToLocalStorage(items) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );
    } catch (error) {
        console.error('Помилка збереження ігор:', error);
    }
}

// Завантажуємо збережені ігри
function loadFromLocalStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw === null) {
            return null;
        }

        const data = JSON.parse(raw);

        return Array.isArray(data) ? data : null;
    } catch (error) {
        console.error('Помилка читання localStorage:', error);
        return null;
    }
}

/* =========================================
   ПРАКТИКУМ 11. INDEXEDDB
========================================= */

const DB_NAME = 'BoardgameCatalogDB';
const DB_VERSION = 1;
const STORE_NAME = 'games';

// Відкриття бази даних IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Створення сховища при першому запуску
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'id'
                });
            }
        };

        // Успішне відкриття бази
        request.onsuccess = () => {
            resolve(request.result);
        };

        // Помилка відкриття
        request.onerror = () => {
            reject(request.error);
        };
    });
}

/* =========================================
   CRUD-ОПЕРАЦІЇ INDEXEDDB
========================================= */

// Додавання або оновлення гри
async function putGameToDB(game) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');

        tx.objectStore(STORE_NAME).put(game);

        tx.oncomplete = () => {
            db.close();
            resolve();
        };

        tx.onerror = () => {
            const error = tx.error;
            db.close();
            reject(error);
        };
    });
}

// Отримання всіх збережених ігор
async function getAllGamesFromDB() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const request = tx.objectStore(STORE_NAME).getAll();

        let games = [];

        request.onsuccess = () => {
            games = request.result;
        };

        tx.oncomplete = () => {
            db.close();
            resolve(games);
        };

        tx.onerror = () => {
            const error = tx.error;
            db.close();
            reject(error);
        };
    });
}

// Видалення гри за її id
async function deleteGameFromDB(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');

        tx.objectStore(STORE_NAME).delete(id);

        tx.oncomplete = () => {
            db.close();
            resolve();
        };

        tx.onerror = () => {
            const error = tx.error;
            db.close();
            reject(error);
        };
    });
}

/* =========================================
   МІГРАЦІЯ LOCALSTORAGE В INDEXEDDB
========================================= */

const MIGRATION_KEY = 'boardgameCatalogMigrated';

// Одноразове перенесення збережених ігор
async function migrateGamesToIndexedDB() {

    // Перевіряємо, чи виконувалася міграція
    if (localStorage.getItem(MIGRATION_KEY) === 'true') {
        console.log('Міграцію вже виконано');
        return;
    }

    // Перевіряємо поточні записи IndexedDB
    const existingGames = await getAllGamesFromDB();

    if (existingGames.length > 0) {
        console.log('IndexedDB не порожня. Міграцію пропущено');
        return;
    }

    // Читаємо попередні дані
    const savedGames = loadFromLocalStorage();

    if (!savedGames || savedGames.length === 0) {
        console.log('Немає даних для міграції');
        return;
    }

    // Переносимо ігри зі збереженням старих полів
    for (const game of savedGames) {
        const migratedGame = {
            ...game,
            players: `${game.minPlayers}-${game.maxPlayers}`,
            duration: game.duration ?? null,
            owned: game.owned ?? false,
            played: game.played ?? false
        };

        await putGameToDB(migratedGame);
    }

    // Позначаємо завершення міграції
    localStorage.setItem(MIGRATION_KEY, 'true');

    console.log(
        `Успішно перенесено ${savedGames.length} ігор в IndexedDB`
    );
}


// Для практикуму 10 обрано Vue 3, оскільки він дозволяє
// створювати реактивні компоненти без Node.js та збірки.

// Функція перевіряє кількість гравців
const fitsPlayers = (game, n) => {
    return n >= game.minPlayers && n <= game.maxPlayers;
};

// Функція з практикуму 6 для перевірки ігор у Console
function showGames(gamesList, count) {
    console.log(`Перевірка ігор для ${count} гравців:`);

    for (const game of gamesList) {
        if (fitsPlayers(game, count)) {
            console.log(`${game.title} - підходить`);
        } else {
            console.log(`${game.title} - не підходить`);
        }
    }
}


// =========================================
// ПРАКТИКУМ 10. VUE 3
// =========================================

// Компонент окремої картки настільної гри
const GameCard = {
    props: {
        id: Number,
        played: Boolean,
        title: String,
        minPlayers: Number,
        maxPlayers: Number,
        genre: String,
        image: String,
        alt: String,

        // Практикум 12: визначення гри дня
        isGameOfDay: Boolean
    },

    emits: ['filter', 'toggle-played', 'delete-game'],

    computed: {
        genreLabel() {
            const genres = {
                strategy: 'Стратегія',
                party: 'Паті-гейм',
                family: 'Сімейна'
            };

            return genres[this.genre] || this.genre;
        }
    },

    template: `
        <article
            class="card"
            :class="{
                fits: minPlayers <= 4 && maxPlayers >= 4,
                'game-of-day': isGameOfDay
            }"
            :data-players="minPlayers + '-' + maxPlayers"
        >
            <p class="badge">
                👥 {{ minPlayers }}-{{ maxPlayers }} гравців
            </p>

            <!-- Практикум 12. Позначка гри дня -->
            <p v-if="isGameOfDay" class="game-day-label">
                Гра дня
            </p>

            <h3>{{ title }}</h3>

            <img
                v-if="image"
                :src="image"
                :alt="alt"
            >

            <button
                type="button"
                class="game-genre"
                @click="$emit('filter', genre)"
            >
                Жанр: {{ genreLabel }}
            </button>

            <p>
                Статус: {{ played ? 'Зіграно' : 'Не зіграно' }}
            </p>

            <button
                type="button"
                class="game-genre"
                @click="$emit('toggle-played', id)"
            >
                {{ played ? 'Скасувати зіграно' : 'Позначити як зіграну' }}
            </button>

            <button
                type="button"
                class="game-genre"
                @click="$emit('delete-game', id)"
            >
                Видалити гру
            </button>
        </article>
    `
};

// Головний Vue-застосунок
const vueApp = Vue.createApp({
    components: {
        GameCard
    },

    data() {
        return {
            // Реактивний масив настільних ігор
            games: [
                {
                    id: 1,
                    title: 'Каркассон',
                    minPlayers: 2,
                    maxPlayers: 5,
                    genre: 'family',
                    image: 'assets/img/Carcassonne.png',
                    alt: 'Фото ігрового процесу Каркассон'
                },
                {
                    id: 2,
                    title: 'Манчкін',
                    minPlayers: 3,
                    maxPlayers: 6,
                    genre: 'party',
                    image: 'assets/img/munchkin.jpg',
                    alt: 'Коробка настільної гри Манчкін'
                },
                {
                    id: 3,
                    title: 'Монополія',
                    minPlayers: 2,
                    maxPlayers: 6,
                    genre: 'family',
                    image: 'assets/img/monopoly.jpg',
                    alt: 'Ігрове поле Монополії'
                }
            ],

            activeGenre: null,
            selectedPlayers: null,
            nextId: 4,
            storageReady: false
        };
    },

    // Завантаження ігор із IndexedDB при запуску Vue
    async created() {
        try {
            // Переносимо старі дані, якщо міграція ще не виконана
            await migrateGamesToIndexedDB();

            // Читаємо записи з браузерної бази даних
            const dbGames = await getAllGamesFromDB();

            // Порожню раніше ініціалізовану базу не заповнюємо знову
            if (
                dbGames.length > 0 ||
                localStorage.getItem(MIGRATION_KEY) === 'true' ||
                localStorage.getItem('boardgameCatalogDBInitialized') === 'true'
            ) {
                this.games = dbGames;
            } else {
                // Перший запуск: зберігаємо початкові три гри
                for (const game of this.games) {
                    await putGameToDB({
                        ...game,
                        players: `${game.minPlayers}-${game.maxPlayers}`,
                        duration: null,
                        owned: false,
                        played: false
                    });
                }
            }

            localStorage.setItem(
                'boardgameCatalogDBInitialized',
                'true'
            );

            this.storageReady = true;

            // Обчислюємо наступний унікальний id
            this.nextId = Math.max(
                0,
                ...this.games.map(game => Number(game.id) || 0)
            ) + 1;

            console.log(
                `Завантажено з IndexedDB: ${dbGames.length} ігор`
            );

        } catch (error) {
            console.error('Помилка IndexedDB:', error);
            alert('IndexedDB недоступна. Показано резервні дані.');

            // Резервне завантаження з localStorage
            const savedGames = loadFromLocalStorage();

            if (savedGames !== null) {
                this.games = savedGames;
            }

            this.nextId = Math.max(
                0,
                ...this.games.map(game => Number(game.id) || 0)
            ) + 1;
        }
    },

    // Автоматично обчислюємо реактивні значення
    computed: {

        // Практикум 12. Гра дня на основі дати та каталогу
        gameOfDayId() {
            if (this.games.length === 0) {
                return null;
            }

            const today = new Date();

            const dayNumber = Math.floor(
                Date.UTC(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate()
                ) / 86400000
            );

            const index = dayNumber % this.games.length;

            return this.games[index].id;
        },

        // Список після застосування фільтрів
        filteredGames() {
            return this.games.filter(game => {
                const genreMatches =
                    this.activeGenre === null ||
                    game.genre === this.activeGenre;

                const playersMatch =
                    this.selectedPlayers === null ||
                    fitsPlayers(game, this.selectedPlayers);

                return genreMatches && playersMatch;
            });
        }
    },

    methods: {
        // Обробляємо подію filter від компонента GameCard
        filterByGenre(genre) {
            this.activeGenre = genre;

            console.log(`Обрано жанр: ${genre}`);
        },

        // Повертаємо відображення всіх жанрів
        resetGenre() {
            this.activeGenre = null;
        },

        // Змінюємо фільтр кількості гравців
        setPlayersFilter(count) {
            this.selectedPlayers = count;
        },

        // Додавання нової гри в IndexedDB та Vue
        async addGame(game) {
            if (!this.storageReady) {
                throw new Error('IndexedDB ще не готова');
            }

            const newGame = {
                id: this.nextId,
                ...game,
                players: `${game.minPlayers}-${game.maxPlayers}`,
                duration: null,
                owned: false,
                played: false
            };

            await putGameToDB(newGame);

            this.games.push(newGame);
            this.nextId++;

            saveToLocalStorage(this.games);

            this.activeGenre = null;
            this.selectedPlayers = null;
        },

        // Оновлення статусу «зіграно» без створення дубліката
        async togglePlayed(id) {
            const game = this.games.find(item => item.id === id);

            if (!game || !this.storageReady) {
                return;
            }

            const updated = {
                ...game,
                played: !game.played
            };

            try {
                await putGameToDB(updated);
                Object.assign(game, updated);
                saveToLocalStorage(this.games);
            } catch (error) {
                console.error('Помилка оновлення статусу:', error);
                alert('Не вдалося оновити статус гри');
            }
        },

        // Видалення гри з IndexedDB та Vue
        async removeGame(id) {
            const game = this.games.find(item => item.id === id);

            if (!game || !this.storageReady) {
                return;
            }

            if (!confirm(`Видалити гру «${game.title}»?`)) {
                return;
            }

            try {
                await deleteGameFromDB(id);

                this.games = this.games.filter(
                    item => item.id !== id
                );

                saveToLocalStorage(this.games);
            } catch (error) {
                console.error('Помилка видалення:', error);
                alert('Не вдалося видалити гру');
            }
        }
    }
}).mount('#vue-games-app');

// Перевірка функцій із практикуму 6
const playersCount = 2;

showGames(vueApp.games, playersCount);

console.log('Результат стрілкової функції:');

for (const game of vueApp.games) {
    console.log(
        `${game.title}: ${fitsPlayers(game, playersCount)}`
    );
}


// =========================================
// ПРАКТИКУМ 8. ФОРМИ ТА ВАЛІДАЦІЯ
// =========================================

// Елементи форми додавання нової гри
const addGameForm = document.querySelector('#add-game-form');
const titleInput = document.querySelector('#game-title');
const minPlayersInput = document.querySelector('#min-players');
const maxPlayersInput = document.querySelector('#max-players');
const genreSelect = document.querySelector('#new-game-genre');
const formError = document.querySelector('#form-error');

// Елементи форми фільтрації
const playersSelect = document.querySelector('#players-count');
const filterForm = document.querySelector('#filters form');

// Обробник надсилання форми нової гри
addGameForm.addEventListener('submit', async event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const minPlayers = Number(minPlayersInput.value);
    const maxPlayers = Number(maxPlayersInput.value);
    const genre = genreSelect.value;

    formError.textContent = '';

    // Перевірка кількості гравців
    if (minPlayers > maxPlayers) {
        formError.textContent =
            'Помилка: мінімальна кількість гравців не може перевищувати максимальну.';
        return;
    }

    // Перевірка назви гри
    if (title === '') {
        formError.textContent =
            'Помилка: введіть назву гри.';
        return;
    }

    // Створюємо новий об'єкт гри
    const newGame = {
        title: title,
        minPlayers: minPlayers,
        maxPlayers: maxPlayers,
        genre: genre,
        image: '',
        alt: ''
    };

    try {
        // Зберігаємо гру в IndexedDB перед очищенням форми
        await vueApp.addGame(newGame);

        playersSelect.value = '';

        console.log(`Додано нову гру: ${title}`);

        addGameForm.reset();
    } catch (error) {
        formError.textContent =
            'Не вдалося зберегти гру в IndexedDB.';

        console.error('Помилка збереження:', error);
    }
});

// Очищаємо повідомлення про помилку
minPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

maxPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

// Фільтрація через реактивний стан Vue
playersSelect.addEventListener('change', () => {
    const value = playersSelect.value;

    vueApp.setPlayersFilter(
        value === '' ? null : Number(value)
    );
});

// Запобігаємо перезавантаженню форми фільтрації
filterForm.addEventListener('submit', event => {
    event.preventDefault();

    const value = playersSelect.value;

    vueApp.setPlayersFilter(
        value === '' ? null : Number(value)
    );
});


// =========================================
// ПРАКТИКУМ 9. РОБОТА ІЗ ЗОВНІШНІМ API
// =========================================

const apiListContainer = document.querySelector('#api-games-list');
const apiLoading = document.querySelector('#api-loading');
const apiError = document.querySelector('#api-error');
const refreshApiButton = document.querySelector('#refresh-api');

// Відображення ігор із зовнішнього API
function renderApiGames(gamesList) {
    apiListContainer.replaceChildren();

    for (const game of gamesList) {
        const card = document.createElement('article');
        card.classList.add('card');

        const title = document.createElement('h3');
        title.textContent = game.title;

        const status = document.createElement('p');
        status.classList.add('api-status');

        status.textContent = game.completed
            ? 'Вже зіграно'
            : 'Ще не зіграно';

        card.append(title, status);
        apiListContainer.append(card);
    }
}

// Завантаження даних з JSONPlaceholder API
async function loadApiGames() {
    apiLoading.hidden = false;
    apiError.hidden = true;
    apiError.textContent = '';
    refreshApiButton.disabled = true;

    try {
        // Надсилаємо GET-запит
        const response = await fetch(API_URL);

        // Перевіряємо HTTP-статус
        if (!response.ok) {
            throw new Error(
                `HTTP помилка: ${response.status}`
            );
        }

        // Отримуємо JSON
        const data = await response.json();

        console.log('Дані, отримані з API:', data);

        // Перевіряємо формат відповіді
        if (!Array.isArray(data)) {
            throw new Error('Некоректний формат відповіді API');
        }

        // Відображаємо записи з API
        renderApiGames(data);

        console.log(
            `Завантажено записів: ${data.length}`
        );

    } catch (error) {
        apiError.textContent =
            'Не вдалося завантажити ігри. Перевірте з’єднання та спробуйте ще раз.';

        apiError.hidden = false;

        console.error(
            'Помилка завантаження API:',
            error
        );

    } finally {
        apiLoading.hidden = true;
        refreshApiButton.disabled = false;
    }
}

// Повторне завантаження API
refreshApiButton.addEventListener('click', () => {
    loadApiGames();
});

// Початкове завантаження API
loadApiGames();
