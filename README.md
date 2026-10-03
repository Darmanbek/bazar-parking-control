# Маршрутный контроль — панель инспектора

Фронтенд панели `ROUTE_INSPECTOR` для поверхности `/api/v1/route-control/*`.
Контракт API (frontend-integration.md) и ТЗ выдаёт команда бэкенда; в репозиторий они не кладутся — репозиторий публичный, а документы внутренние. При расхождении прав контракт.

## Запуск

```bash
npm i
npm run dev      # моки MSW: логин inspector / inspector (expired / inspector — истёкший аккаунт)
npm run build    # прод: VITE_API_BASE_URL из .env.production, без моков
```

| Переменная | Где | Значение |
|---|---|---|
| `VITE_API_BASE_URL` | `.env` (dev), `.env.production` (build) | база API без `/api/v1/route-control`; прод — `https://api.smart-bazar.uz` (H8) |
| `VITE_USE_MOCKS` | `.env` | `true` — отвечать из MSW. В прод-сборке игнорируется: моки и service worker в `dist` не попадают |

## Экраны (контракт §9)

| Маршрут | Экран | API |
|---|---|---|
| `/login` | Вход: `login` + пароль, причина выхода по `code` | `POST auth/login`, `GET me` |
| `/` | День: сводка по маршрутам, «Остальные» числом, заезды реестра, снимок, xlsx | `GET summary/routes`, `GET passes`, `GET passes/{id}/image`, `GET exports/passes` |
| `/candidates` | Кандидаты за закрытый день, K/N по `meta.thresholds`, снимок с тем же `date`, xlsx | `GET candidates`, `GET exports/candidates` |
| `/registry` | Реестр: маршруты и договор на дату | `GET routes` |
| `/registry/$routeId` | Договоры и история назначений; добавить / закрыть с даты / исправить номер (удаления нет) | `GET routes/{id}`, `POST assignments*` |
| `/import` | Загрузка Excel → предпросмотр → подтверждение | `POST registry/imports`, `GET …/{id}`, `POST …/{id}/confirm` |

## Как выполнены требования хостинга (ADR-0033)

- Только статика, без functions и edge middleware (H2). Единственное правило в `vercel.json` — SPA-fallback: любой путь отдаёт `index.html`, чтобы работали прямые ссылки (`/candidates`). Это не прокси: API через Vercel не идёт.
- Браузер ходит в API напрямую с `Authorization: Bearer` и `Accept: application/json`, cookie не используются.
- Шрифты включены в сборку (`@fontsource`), Google Fonts не используется (H6).
- Снимки и xlsx получаются через `fetch` → Blob → `URL.createObjectURL`, URL освобождается при закрытии. В `localStorage` лежат только токен, его `expires_at` и настройки UI (§5.5).
- Автообновление — только для сегодняшнего дня и не чаще раза в минуту; повторов запросов нет (`retry: false`): каждое чтение пишется в аудит (§5.4).
- Ошибки показываются по `code` / `reason` (§5.6). Любой `401` очищает токен и возвращает на вход с причиной.

## Типы API

`api/openapi.yaml` — контракт §7 в виде OpenAPI. `npm run gen` → `src/shared/api/schema.d.ts`. При правке контракта правится этот файл, расхождения всплывают ошибками TypeScript.

## Архитектура

Custom FSD: `app → pages → features → widgets → shared`, импорты только вниз (проверяет `npm run lint`), циклы — `npm run check:cycles`.
