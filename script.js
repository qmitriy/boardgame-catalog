
console.log('script.js підключено');

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
function renderGames(gamesList) {

    // Видаляємо попередні картки зі сторінки
    const oldCards = listContainer.querySelectorAll('.card');

    oldCards.forEach(card => card.remove());

    // Створюємо нові картки
    for (const game of gamesList) {

        const card = document.createElement('article');
        card.classList.add('card');

        card.dataset.players =
            `${game.minPlayers}-${game.maxPlayers}`;

        // Позначаємо ігри, які підходять для 4 гравців
        if (fitsPlayers(game, 4)) {
            card.classList.add('fits');
        }

        // Інформація про кількість гравців
        const players = document.createElement('p');
        players.classList.add('badge');
        players.textContent =
            `👥 ${game.minPlayers}-${game.maxPlayers} гравців`;

        // Назва гри
        const title = document.createElement('h3');
        title.textContent = game.title;

        card.append(players, title);

        // Додаємо зображення, якщо воно є
        if (game.image) {
            const image = document.createElement('img');
            image.src = game.image;
            image.alt = game.alt;

            card.append(image);
        }

        // Додаємо картку на сторінку
        listContainer.append(card);
    }

    // Оновлюємо кількість відображених ігор
    gamesCount.textContent =
        `Кількість ігор: ${gamesList.length}`;
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

// Початкове відображення всіх ігор
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

// При зміні чисел прибираємо попереднє повідомлення
minPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

maxPlayersInput.addEventListener('input', () => {
    formError.textContent = '';
});

// Обробник зміни кількості гравців у фільтрі
playersSelect.addEventListener('change', () => {
    updateDisplayedGames();
});

// Запобігаємо перезавантаженню при натисканні кнопки фільтра
filterForm.addEventListener('submit', event => {
    event.preventDefault();
    updateDisplayedGames();
});
