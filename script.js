
console.log('script.js підключено');

const API_URL = 'https://jsonplaceholder.typicode.com/todos?userId=1';

// Масив настільних ігор
const games = [
    {
        title: 'Каркассон',
        minPlayers: 2,
        maxPlayers: 5,
        genre: 'family',
        image: 'assets/img/Carcassonne.png',
        alt: 'Фото ігрового процесу Каркассон'
    },
    {
        title: 'Манчкін',
        minPlayers: 3,
        maxPlayers: 6,
        genre: 'party',
        image: 'assets/img/munchkin.jpg',
        alt: 'Коробка настільної гри Манчкін'
    },
    {
        title: 'Монополія',
        minPlayers: 2,
        maxPlayers: 6,
        genre: 'family',
        image: 'assets/img/monopoly.jpg',
        alt: 'Ігрове поле Монополії'
    }
];

const listContainer = document.querySelector('#games-list');
const gamesCount = document.querySelector('#games-count');

const playersCount = 2;

// Функція виводить ігри для заданої кількості гравців
function showGames(gamesList, count) {
    console.log(`Перевірка ігор для ${count} гравців:`);

    for (const game of gamesList) {
        if (count >= game.minPlayers && count <= game.maxPlayers) {
            console.log(`${game.title} - підходить`);
        } else {
            console.log(`${game.title} - не підходить`);
        }
    }
}

// Стрілкова функція перевіряє кількість гравців
const fitsPlayers = (game, n) => {
    return n >= game.minPlayers && n <= game.maxPlayers;
};

showGames(games, playersCount);

console.log('Результат стрілкової функції:');

for (const game of games) {
    console.log(`${game.title}: ${fitsPlayers(game, playersCount)}`);
}

// Функція створює картки ігор на основі масиву
// Використовується для локальних ігор та даних API
function renderGames(gamesList, container = listContainer, isApi = false) {

    // Видаляємо попередні картки
    const oldCards = container.querySelectorAll('.card');
    oldCards.forEach(card => card.remove());

    for (const game of gamesList) {

        const card = document.createElement('article');
        card.classList.add('card');

        const title = document.createElement('h3');
        title.textContent = game.title;

        // Картки ігор, отриманих із зовнішнього API
        if (isApi) {
            const status = document.createElement('p');
            status.classList.add('api-status');

            if (game.completed) {
                status.textContent = 'Вже зіграно';
            } else {
                status.textContent = 'Ще не зіграно';
            }

            card.append(title, status);
        } else {

            // Атрибут з кількістю гравців
            card.dataset.players =
                `${game.minPlayers}-${game.maxPlayers}`;

            // Позначаємо ігри для 4 гравців
            if (fitsPlayers(game, 4)) {
                card.classList.add('fits');
            }

            const players = document.createElement('p');
            players.classList.add('badge');
            players.textContent =
                `👥 ${game.minPlayers}-${game.maxPlayers} гравців`;

            card.append(players, title);

            // Додаємо зображення, якщо воно є
            if (game.image) {
                const image = document.createElement('img');
                image.src = game.image;
                image.alt = game.alt;

                card.append(image);
            }
        }

        // Додаємо готову картку в контейнер
        container.append(card);
    }

    // Оновлюємо лічильник локальних ігор
    if (!isApi) {
        gamesCount.textContent =
            `Кількість ігор: ${gamesList.length}`;
    }
}

// Функція фільтрує ігри за кількістю гравців
function updateDisplayedGames() {
    const selectedCount = playersSelect.value;

    if (selectedCount === '') {
        renderGames(games);
    } else {
        const count = Number(selectedCount);

        const filteredGames = games.filter(game =>
            fitsPlayers(game, count)
        );

        renderGames(filteredGames);
    }
}

// Початкове відображення локальних ігор
renderGames(games);

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

    // Перевіряємо правильність кількості гравців
    if (minPlayers > maxPlayers) {
        formError.textContent =
            'Помилка: мінімальна кількість гравців не може перевищувати максимальну.';
        return;
    }

    // Перевіряємо назву гри
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

    // Додаємо гру до масиву
    games.push(newGame);

    // Оновлюємо список без перезавантаження
    updateDisplayedGames();

    console.log(`Додано нову гру: ${title}`);

    // Очищаємо форму
    addGameForm.reset();
});

// Очищаємо попереднє повідомлення про помилку
minPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

maxPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

// Фільтрація при зміні кількості гравців
playersSelect.addEventListener('change', () => {
    updateDisplayedGames();
});

// Запобігаємо перезавантаженню при натисканні кнопки фільтра
filterForm.addEventListener('submit', event => {
    event.preventDefault();
    updateDisplayedGames();
});


// =========================================
// ПРАКТИКУМ 9. РОБОТА ІЗ ЗОВНІШНІМ API
// =========================================

// Елементи для роботи з API
const apiListContainer = document.querySelector('#api-games-list');
const apiLoading = document.querySelector('#api-loading');
const apiError = document.querySelector('#api-error');
const refreshApiButton = document.querySelector('#refresh-api');

// Функція завантажує дані з JSONPlaceholder API
// https://jsonplaceholder.typicode.com/
async function loadApiGames() {

    // Показуємо стан завантаження
    apiLoading.hidden = false;
    apiError.hidden = true;
    apiError.textContent = '';
    refreshApiButton.disabled = true;

    try {
        // Надсилаємо GET-запит до API
        const response = await fetch(API_URL);

        // Перевіряємо HTTP-статус
        if (!response.ok) {
            throw new Error(`HTTP помилка: ${response.status}`);
        }

        // Отримуємо дані у форматі JSON
        const data = await response.json();

        console.log('Дані, отримані з API:', data);

        // Перевіряємо формат відповіді
        if (!Array.isArray(data)) {
            throw new Error('Некоректний формат відповіді API');
        }

        // Використовуємо функцію рендеру з практикуму 7
        renderGames(data, apiListContainer, true);

        console.log(`Завантажено записів: ${data.length}`);

    } catch (error) {

        // Повідомлення для користувача
        apiError.textContent =
            'Не вдалося завантажити ігри. Перевірте з’єднання та спробуйте ще раз.';

        apiError.hidden = false;

        // Детальна помилка для розробника
        console.error('Помилка завантаження API:', error);

    } finally {

        // Приховуємо завантаження незалежно від результату
        apiLoading.hidden = true;
        refreshApiButton.disabled = false;
    }
}

// Кнопка повторного завантаження даних
refreshApiButton.addEventListener('click', () => {
    loadApiGames();
});

// Завантажуємо дані при відкритті сторінки
loadApiGames();
