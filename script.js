
console.log('script.js підключено');

// Масив настільних ігор
const games = [
    { title: 'Каркассон', minPlayers: 2, maxPlayers: 5 },
    { title: 'Манчкін', minPlayers: 3, maxPlayers: 6 },
    { title: 'Монополія', minPlayers: 2, maxPlayers: 6 }
];

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
