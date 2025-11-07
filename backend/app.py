from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from backend.api import auth as auth_api  # type: ignore
from backend.api import reports as reports_api  # type: ignore
from backend.core.security import get_current_user_optional

BASE_DIR = Path(__file__).resolve().parent

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app = FastAPI(title="Quarter Labels", version="1.0.0")

app.include_router(auth_api.router, prefix="/auth", tags=["auth"])
app.include_router(reports_api.router, prefix="/reports", tags=["reports"])

static_dir = BASE_DIR / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request, user: Optional[dict] = Depends(get_current_user_optional)) -> HTMLResponse:
    return templates.TemplateResponse(
        "upload.html",
        {
            "request": request,
            "user": user,
            "app_name": "Этикетки успеваемости",
        },
    )


@app.get("/reports/current/ui", response_class=HTMLResponse)
async def report_ui(request: Request, user: Optional[dict] = Depends(get_current_user_optional)) -> HTMLResponse:
    return templates.TemplateResponse(
        "upload.html",
        {
            "request": request,
            "user": user,
            "app_name": "Этикетки успеваемости",
        },
    )


@app.get("/reports/current/preview/ui", response_class=HTMLResponse)
async def preview_ui(request: Request, session: str, user: Optional[dict] = Depends(get_current_user_optional)) -> HTMLResponse:
    return templates.TemplateResponse(
        "preview.html",
        {
            "request": request,
            "user": user,
            "session": session,
            "app_name": "Этикетки успеваемости",
        },
    )
