# test2

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Почистить кэш npm
```
rm -rf node_modules/.cache
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Логи фронта

Для включения задайте в локальном `.env` и перезапустите dev server:

```dotenv
VUE_APP_DOMAIN_FRONTEND_LOGS=http://127.0.0.1:8003/api/frontend_logs
```

Пустое значение отключает сборщик. Это полный URL, без добавления `/api/v1`.
Для production добавьте одноимённый GitHub Actions secret и пересоберите образ.
Переменная также передаётся через Docker Compose build args. Сервис на другом
origin должен разрешать CORS для origin фронта, POST, Content-Type и Authorization.

Сборщик находится в `src/lib/frontend-logs`, подключается в `src/main.ts`.
`context.ts` подключён к двум игровым страницам и читает ID карт при ошибке;
watchers и история действий не используются. `index.ts` содержит разрешённый
список полей игрового контекста. Обычный `callApi` не изменён.

Отправка: POST, `Authorization: Bearer <текущий access token>`, JSON:

```json
{
  "events": [{
    "event_id": "uuid",
    "timestamp": "2026-10-01T12:00:00.000Z",
    "level": "error",
    "source": "vue",
    "message": "Cannot read properties of undefined",
    "error_name": "TypeError",
    "error_function": "timeoutAnimationFlag",
    "error_file": "src/logic/game_logic/timers.ts",
    "error_line": 34,
    "error_column": 12,
    "stack_frames": [{
      "function": "timeoutAnimationFlag",
      "file": "src/logic/game_logic/timers.ts",
      "line": 34,
      "column": 12
    }],
    "fingerprint": "a1b2c3d4",
    "environment": "development_local",
    "context": {
      "user_id": 123,
      "route": "/game",
      "mode": "normal",
      "level_id": 4,
      "deck_id": 2,
      "health": 80,
      "armor": 5,
      "player_turn": true,
      "ai_move": false,
      "ppa_end_turn": false,
      "epa_end_turn": false,
      "hand_card_ids": [12, 31],
      "field_card_ids": [null, 42, null],
      "location": "component: event handler"
    }
  }]
}
```

`source`: `vue`, `window`, `promise`, `console`; `level`: `error`, `warning`.
Неизвестные поля контекста, environment и недоступные поля стека опускаются.
Вне игровой страницы массивы карт отсутствуют; выбранный уровень/колода могут
оставаться в store после выхода из боя, поэтому проверяйте также `route`.
`user_id` диагностический: сервис проверяет токен, не обязан запрашивать базу
пользователей. Успех — любой 2xx (например, 204), тело ответа не используется.
Release, session/game ID и breadcrumbs пока не отправляются.

Ограничения одной вкладки: одинаковая ошибка раз в 5 минут, warning раз в 15 минут;
до 10 событий в минуту, включая максимум 3 warnings. Пачка до 5 событий,
очередь до 20, событие до 16 КиБ. Очередь существует только в памяти.
Доставка начинается через секунду; timeout 4 секунды. Любая ошибка доставки,
включая 401, очищает очередь и включает минутную паузу. Повторов доставки,
refresh токена, toast и logout нет. Вход/выход из аккаунта очищает очередь,
дедупликацию и отменяет активный запрос. Без токена события отбрасываются.
Лимиты нужно также настроить на сервере: ограничения вкладки не ограничивают
суммарный поток пользователей.

Консоль продолжает работать. Произвольные объекты в её аргументах заменяются
на `[object omitted]`; у Error берутся только name/message/stack. Из строк
удаляются известные текущие токены, пароль, email и типовые записи секретов.
Это не универсальное распознавание персональных данных в произвольном тексте:
не печатайте чувствительные данные в сообщениях ошибок.

Vue warnings доступны только в development. Обработанные и скрытые исключения,
логические ошибки без исключения, сообщения DevTools, не вызванные через
console.warn/error, и ошибки до установки сборщика автоматически не собираются.
Для расшифровки минифицированных стеков сохраняйте source maps конкретной сборки.

Проверка сборщика (без сети и новых зависимостей):

```sh
node --test tests/frontend-logs.test.cjs
```

### Расширенный контекст и стек

`route` содержит текущий path (`/game`), без query/hash. Контекст также содержит
`leader_id`, `enemy_leader_id`, `deck_card_ids`, `grave_card_ids`,
`enemy_deck_card_ids` (gameObj.enemies), `enemy_grave_card_ids`.
Массивы сохраняют порядок и повторяющиеся карты, до 100 позиций каждый.

`context.effects` содержит снимок `gameObj.effects` (до 100 позиций):
тип `type`, а также `turns`, `times_count`, `value`, если они заданы.
Нулевые значения сохраняются, отсутствующие поля не отправляются.
Пустые слоты представлены как `null`; порядок соответствует игровому полю.

Стек отправляется только в структурированном виде: `stack_frames` содержит
список кадров: `function`, `file`, `line`, `column`. Нераспознанный кадр сохраняется
как `text`. Префиксы webpack loaders и query файлов убираются из `file`.
Поля `error_function`, `error_file`, `error_line`, `error_column` дублируют
место возникновения из первого кадра для удобного поиска; недоступные поля
опускаются. Пример для тестовой ошибки:

```json
{
  "error_function": "timeoutAnimationFlag",
  "error_file": "src/logic/game_logic/timers.ts",
  "error_line": 34,
  "error_column": 12,
  "stack_frames": [
    { "function": "timeoutAnimationFlag", "file": "src/logic/game_logic/timers.ts", "line": 34, "column": 12 },
    { "function": "hit_one_enemy", "file": "src/logic/player_move/abilities/hit_one_enemy.ts", "line": 12, "column": 81 }
  ]
}
```

Разбор стека не применяет source maps: номера относятся к коду, указанному
браузером, и могут отличаться от строк исходников. Если у ошибки нет stack,
поля кадров не отправляются. Общий лимит события остаётся 16 КиБ.
Схему будущего сервиса следует строить по этому формату; строковое поле `stack` не отправляется.

### Устойчивость сбора

Каждое поле контекста читается отдельно: повреждённый или отсутствующий массив
не мешает отправить маршрут, флаги хода и остальные доступные данные.
Повторный перехват того же объекта Error подавляется на одну секунду;
основное окно одинаковых ошибок остаётся пять минут (warnings — 15 минут).

Если событие превышает 16 КиБ, выставляется `truncated: true` и удаляются
крупнейшие поля контекста до попадания в лимит. Если этого недостаточно,
сокращается хвост стека, затем длинные строки. Сообщение и первый кадр
сохраняются, при необходимости в сокращённом виде. Лимит измеряется в UTF-8 байтах.
