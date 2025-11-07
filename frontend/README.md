# Class Assistant Frontend

Современное SPA для сервиса классного руководителя. Реализовано на стеке Vite + React + TypeScript с использованием TailwindCSS, shadcn/ui и TanStack Query.

## Требования
- Node.js 18+
- npm 9+

## Установка
```bash
npm install
```

## Переменные окружения
Скопируйте `.env.example` в `.env` и настройте адрес API:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Скрипты
- `npm run dev` — запуск Vite dev server на 5173 порту
- `npm run build` — сборка production бандла
- `npm run preview` — предпросмотр собранной версии
- `npm run test` — запуск Vitest
- `npm run lint` — проверка ESLint
- `npm run format` — форматирование исходников Prettier

## Структура
```
frontend/
  src/
    app/          # Shell, маршрутизация, провайдеры
    entities/     # API-клиенты и Zustand сторы
    features/     # Фичи (дропзона, фильтры, экспорт)
    pages/        # Страницы маршрутов
    shared/       # UI-компоненты, утилиты, i18n, стили
    tests/        # Тесты и тестовые утилиты
```

## Основные возможности
- Авторизация с помощью FastAPI backend (`/api/auth/login`)
- Загрузка XLSX с валидацией и управлением сессией (`/api/upload`, `/api/session/*`)
- Таблица учеников с фильтрами, поиском, виртуализацией и экспортом CSV (`/api/students`)
- Карточка ученика с вкладками успеваемости, посещаемости и динамики (`/api/students/:id`)
- Отчёты по успеваемости и рискам с экспортом PDF/XLSX (`/api/reports/*`)
- Генерация этикеток с предпросмотром и скачиванием PDF (`/api/labels/*`)
- Настройки темы, языка и параметров сессии

## API
Все запросы выполняются на базовый URL `VITE_API_BASE_URL` и используют cookie-сессию (`withCredentials`). Ожидаемые эндпоинты:

| Метод | Путь | Назначение |
|-------|------|------------|
| POST | `/api/auth/login` | Вход пользователя |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/upload` | Загрузка XLSX |
| GET | `/api/session/status` | Состояние сессии |
| POST | `/api/session/clear` | Очистка сессии |
| GET | `/api/students` | Список учеников |
| GET | `/api/students/:id` | Детальная карточка ученика |
| GET | `/api/reports/current` | Сводный отчёт |
| GET | `/api/reports/current.{pdf|xlsx}` | Экспорт отчёта |
| POST | `/api/labels/preview` | Предпросмотр этикеток |
| GET | `/api/labels/pdf` | PDF этикеток |

## Работа сессии
Загруженные данные живут в пользовательской сессии и автоматически очищаются по таймауту. Таймер отображается в шапке, а за 2 минуты до очистки показывается предупреждающий тост.

## Тестирование
В проекте настроен Vitest + React Testing Library. Покрыты ключевые сценарии: загрузка файла, рендер списка учеников, предпросмотр этикеток и редирект неавторизованного пользователя.
