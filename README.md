# Контроль стоянки рынка

Пульт охраны автостоянки: дашборд (всего / лицензированных / нелицензированных машин), живая таблица машин за период, карточка одной машины с историей заездов, выгрузка в Excel.

## Запуск

```bash
npm i
npm run dev        # http://localhost:5173, демо-вход: admin / admin
```

## Пока нет бэкенда

- Контракт API — черновик [api/openapi.draft.yaml](api/openapi.draft.yaml). Его стоит отдать бэкенду как предлагаемый контракт.
- Типы генерируются из него: `npm run gen:draft` → `src/shared/api/schema.d.ts`.
- Ответы отдаёт MSW (`src/app/mocks`), когда `VITE_USE_MOCKS=true` в `.env`. Моки «живые»: каждые ~6 с на стоянку въезжает или выезжает машина.

Когда бэкенд готов:

1. В `.env`: `VITE_API_URL=<адрес бэкенда>`, `VITE_USE_MOCKS=false`.
2. Поправить URL в скрипте `gen` в `package.json` и запустить `npm run gen` — расхождения с черновиком всплывут ошибками TypeScript в местах вызова.

## Страницы

| Маршрут | Что там |
|---|---|
| `/login` | Авторизация |
| `/` | Дашборд: 3 счётчика (они же фильтр по статусу), таблица, фильтр по датам, поиск по номеру, автообновление, Excel |
| `/cars/$carId` | Карточка машины: последний снимок, статус, история заездов за период, Excel |

Все фильтры (даты, статус, поиск, страница) лежат в URL — отфильтрованный вид переживает перезагрузку, ссылкой можно поделиться.

## Архитектура

Custom FSD: `app → pages → features → widgets → shared` (импорты только вниз, проверяет `npm run lint`).

- `src/pages` — файловые маршруты TanStack Router (тонкие).
- `src/features/{auth,cars,car}` — страницы.
- `src/widgets` — переиспользуемые блоки: `actions`, `car`, `layout`, `shared`, `router-boundary`.
- `src/shared` — `$api` (openapi-fetch + openapi-react-query), хуки, сторы (zustand), UI.

## Скрипты

`dev` · `build` · `lint` · `check:cycles` · `gen` · `gen:draft` · `format`
