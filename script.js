
console.log('script.js підключено');

// Масив настільних ігор
const games = [
    {
        title: 'Каркассон',
        minPlayers: 2,
        maxPlayers: 5,
        image: 'assets/img/Carcassonne.png',
        alt: 'Фото ігрового процесу Каркассон'
    },
    {
        title: 'Манчкін',
        minPlayers: 3,
        maxPlayers: 6,
        image: 'assets/img/munchkin.jpg',
        alt: 'Коробка настільної гри Манчкін'
    },
    {
        title: 'Монополія',
        minPlayers: 2,
        maxPlayers: 6,
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

    // Видаляємо старі картки зі сторінки
    const oldCards = listContainer.querySelectorAll('.card');

    oldCards.forEach(card => card.remove());

    // Створюємо нові картки
    for (const game of gamesList) {

        const card = document.createElement('article');
        card.classList.add('card');

        // Додаємо атрибут з кількістю гравців
        card.dataset.players = `${game.minPlayers}-${game.maxPlayers}`;

        // Позначаємо ігри, які підходять для 4 гравців
        if (fitsPlayers(game, 4)) {
            card.classList.add('fits');
        }

        // Створюємо інформацію про кількість гравців
        const players = document.createElement('p');
        players.classList.add('badge');
        players.textContent = `👥 ${game.minPlayers}-${game.maxPlayers} гравців`;

        // Створюємо назву гри
        const title = document.createElement('h3');
        title.textContent = game.title;

        // Створюємо зображення гри
        const image = document.createElement('img');
        image.src = game.image;
        image.alt = game.alt;

        // Додаємо елементи до картки
        card.append(players, title, image);

        // Додаємо картку на сторінку
        listContainer.append(card);
    }

    // Оновлюємо загальну кількість ігор
    gamesCount.textContent = `Кількість ігор: ${gamesList.length}`;
}

// Виводимо всі ігри на сторінку
renderGames(games);
