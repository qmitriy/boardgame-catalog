
console.log('script.js підключено');

const API_URL = 'https://jsonplaceholder.typicode.com/todos?userId=1';

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
        title: String,
        minPlayers: Number,
        maxPlayers: Number,
        genre: String,
        image: String,
        alt: String
    },

    emits: ['filter'],

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
            :class="{ fits: minPlayers <= 4 && maxPlayers >= 4 }"
            :data-players="minPlayers + '-' + maxPlayers"
        >
            <p class="badge">
                👥 {{ minPlayers }}-{{ maxPlayers }} гравців
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
            nextId: 4
        };
    },

    // Автоматично обчислюємо відфільтрований список
    computed: {
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

        // Додаємо нову гру в реактивний масив
        addGame(game) {
            this.games.push({
                id: this.nextId++,
                ...game
            });

            // Скидаємо фільтри для показу нової гри
            this.activeGenre = null;
            this.selectedPlayers = null;
        }
    }
}).mount('#vue-games-app');

// Перевірка функцій із практикуму 6
const playersCount = 2;

showGames(vueApp.games, playersCount);

console.log('Результат стрілкової функції:');

for (const game of vueApp.games) {
    console.log(`${game.title}: ${fitsPlayers(game, playersCount)}`);
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
addGameForm.addEventListener('submit', event => {
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

    // Додаємо гру через Vue замість ручного DOM
    vueApp.addGame(newGame);

    // Скидаємо вибір кількості гравців
    playersSelect.value = '';

    console.log(`Додано нову гру: ${title}`);

    // Очищаємо форму
    addGameForm.reset();
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

// Зовнішній API залишається окремим розділом
const apiListContainer = document.querySelector('#api-games-list');
const apiLoading = document.querySelector('#api-loading');
const apiError = document.querySelector('#api-error');
const refreshApiButton = document.querySelector('#refresh-api');

// Рендер даних API з практикуму 9
// Ручний рендер локальних ігор замінено на Vue GameCard
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
// https://jsonplaceholder.typicode.com/
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
            throw new Error(`HTTP помилка: ${response.status}`);
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

        console.log(`Завантажено записів: ${data.length}`);

    } catch (error) {
        apiError.textContent =
            'Не вдалося завантажити ігри. Перевірте з’єднання та спробуйте ще раз.';

        apiError.hidden = false;

        console.error('Помилка завантаження API:', error);

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
