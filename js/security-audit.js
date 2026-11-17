
/* =========================================
   ПРАКТИКУМ 15. ПЕРЕВІРКА XSS
   Варіант 4. Назва настільної гри
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const home = document.querySelector('#home-view');

    if (!home) {
        return;
    }

    // Розділ перевірки безпеки
    const section = document.createElement('section');
    section.id = 'security-audit';

    const heading = document.createElement('h2');
    heading.textContent = 'Перевірка безпеки';

    const description = document.createElement('p');
    description.textContent =
        'Перевірка безпечного відображення назви гри.';

    const form = document.createElement('form');
    form.className = 'security-test-form';

    const label = document.createElement('label');
    label.textContent = 'Тестова назва гри:';
    label.htmlFor = 'security-game-title';

    const input = document.createElement('input');
    input.id = 'security-game-title';
    input.type = 'text';
    input.required = true;
    input.maxLength = 200;
    input.style.width = '100%';
    input.style.padding = '10px';
    input.style.margin = '10px 0';

    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn-filter';
    button.textContent = 'Перевірити';

    const result = document.createElement('div');
    result.id = 'security-test-result';
    result.className = 'card';
    result.style.marginTop = '20px';

    const resultTitle = document.createElement('h3');
    resultTitle.textContent = 'Результат перевірки';

    const output = document.createElement('p');
    output.textContent = 'Введіть назву гри для перевірки.';

    result.append(resultTitle, output);

    form.append(label, input, button);

    section.append(
        heading,
        description,
        form,
        result
    );

    home.append(section);

    /* =========================================
       БЕЗПЕЧНИЙ ВИВІД ТЕКСТУ
    ========================================= */

    form.addEventListener('submit', event => {
        event.preventDefault();

        const gameTitle = input.value.trim();

        if (!gameTitle) {
            return;
        }

        // textContent не інтерпретує HTML
        output.textContent = gameTitle;

        console.log(
            'Перевірка XSS: назву відображено як текст'
        );
    });

    /* =========================================
       ПЕРЕВІРКА ПРОТОКОЛУ
    ========================================= */

    const protocolInfo = document.createElement('p');

    if (location.protocol === 'https:') {
        protocolInfo.textContent =
            'З’єднання використовує HTTPS.';
    } else {
        protocolInfo.textContent =
            'Використовується локальний HTTP. ' +
            'Для публічного розгортання потрібен HTTPS.';
    }

    section.append(protocolInfo);
});
