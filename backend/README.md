# Сервис печати этикеток успеваемости

Веб-приложение FastAPI + Jinja2 для классных руководителей. Сервис принимает XLSX с ведомостью, разбирает данные о текущей успеваемости учеников и формирует печатные этикетки формата A4 (4 шт. по 105×145 мм) в PDF и Excel.

## Ключевые возможности

* Регистрация и аутентификация пользователей (хранится только учётка, учебные данные не сохраняются).
* Парсер **QuarterReportParser v2** разбирает XLSX по спецификации, поддерживает легенды посещаемости, объединённые ячейки и предупреждения.
* Предпросмотр отчёта «Текущая успеваемость» с агрегированными средними баллами и индикацией слабых предметов.
* Экспорт PDF (2×2 этикетки на листе A4) и Excel с идентичной геометрией, опциональные направляющие.
* Сессионное хранение разобранных данных в TTL-кеше, автоочистка по истечении времени (по умолчанию 45 минут). Для продакшена поддерживается Redis.

## Быстрый старт

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app:app --reload
```

Дополнительно доступны образы Docker (см. ниже).

## Требования и зависимости

* Python 3.12+
* FastAPI, Jinja2, cachetools, reportlab, xlsxwriter, openpyxl, pandas
* Пароли хэшируются через passlib[bcrypt], токены JWT выдаются в cookie (HTTP-only).

## Почему ReportLab для PDF

ReportLab — чисто Python-библиотека, обеспечивающая точный контроль размеров в миллиметрах и не требующая системных зависимостей (в отличие от WeasyPrint). Это упрощает деплой и гарантирует идентичную геометрию этикеток при печати.

## Переменные окружения

| Переменная | Назначение | Значение по умолчанию |
|------------|------------|------------------------|
| `SECRET_KEY` | Секрет для подписи JWT | `dev-secret-key-change-me` |
| `ACCESS_TOKEN_EXPIRE_MIN` | TTL JWT-токена, минуты | `120` |
| `SESSION_TTL_MIN` | TTL сессионных данных отчёта, минуты | `45` |
| `SESSION_REDIS_URL` | Подключение к Redis (`redis://host:port/0`). При наличии используется `RedisSessionStore`. | — |
| `USER_DB_PATH` | Путь к SQLite-базе с учётками | `backend/users.db` |

### Redis как хранилище сессий

Если задать `SESSION_REDIS_URL`, сервис переключится на Redis. Это нужно для горизонтального масштабирования (несколько воркеров / контейнеров). При отсутствии переменной используется in-memory TTLCache.

## Запуск в Docker

```bash
docker build -t quarter-labels ./backend
docker run -p 8000:8000 --env SECRET_KEY=prod-secret quarter-labels
```

Для подключения Redis можно использовать docker-compose:

```bash
docker-compose -f backend/docker-compose.yml up
```

## Структура

```
backend/
  app.py
  api/
    auth.py
    reports.py
  core/
    models.py
    parsing/quarter_parser.py
    services/
      report_builder.py
      pdf_renderer.py
      xlsx_renderer.py
    sessions.py
    security.py
    services/user_service.py
  templates/
    base.html
    upload.html
    preview.html
    label.html
  static/styles.css
  tests/
    ...
```

## Поток работы

1. Пользователь регистрируется/входит.
2. На странице «Отчёт → Текущая успеваемость» указывает период и загружает XLSX.
3. Сервис разбирает файл, строит агрегаты и создаёт временную сессию.
4. Предпросмотр отображает список учеников, предупреждения и кнопки экспорта PDF/Excel.
5. После истечения `SESSION_TTL_MIN` или ручного сброса данные удаляются.

## Расширение отчётов

Каждый новый отчёт оформляется отдельным сервисом построения (например, `services/report_builder_<name>.py`) и собственными шаблонами. Интерфейс `ReportSessionPayload` позволяет переиспользовать хранилище сессий и экспорт.

## Endpoints

| Метод | URL | Назначение |
|-------|-----|------------|
| `POST /auth/register` | Регистрация пользователя |
| `POST /auth/login` | Вход, выдаёт JWT в cookie |
| `POST /auth/logout` | Очистка cookie |
| `POST /reports/current/upload` | Загрузка XLSX и построение предпросмотра |
| `GET /reports/current/preview` | Получение JSON-предпросмотра по `session` |
| `GET /reports/current/export/pdf` | Скачивание PDF этикеток |
| `GET /reports/current/export/xlsx` | Скачивание Excel |
| `POST /reports/current/discard` | Раннее удаление сессии |

### Пример cURL загрузки

```bash
curl -X POST \
  -F "file=@quarter.xlsx" \
  -F "date_from=2025-09-01" \
  -F "date_to=2025-10-24" \
  -F "weak_threshold=2.5" \
  -F "show_weak_subjects=true" \
  http://localhost:8000/reports/current/upload
```

В ответе придёт `session_token`, используйте его для предпросмотра и экспорта.

## Тесты

```bash
cd backend
pytest -q
```

## Ограничения и допущения

* Поддерживается первый лист, где найден заголовок «Предмет».
* Если учебный год отсутствует, год выводится из периода.
* При переполнении этикетки предметами отображается `+ ещё N предметов`.
* Для печати рекомендуется отключить масштабирование в драйвере принтера.

## Добавление новых отчётов

1. Создайте новый парсер или переиспользуйте существующий.
2. Определите модели и сервис построения отчёта (аналогично `report_builder.py`).
3. Добавьте маршруты FastAPI и шаблоны.
4. При необходимости расширьте экспорт PDF/XLSX.
