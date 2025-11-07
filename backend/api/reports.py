from __future__ import annotations

from datetime import date
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from backend.core.models import CurrentReportOptions
from backend.core.parsing.quarter_parser import QuarterReportParser
from backend.core.sessions import create_session_id, delete_session, get_session, store_session
from backend.core.services.report_builder import build_session_payload
from backend.core.services import pdf_renderer, xlsx_renderer

router = APIRouter()
parser = QuarterReportParser()


def _to_bool(value, default=True):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


@router.post("/current/upload")
async def upload_report(
    request: Request,
    file: UploadFile = File(...),
    date_from: str = Form(...),
    date_to: str = Form(...),
    weak_threshold: float = Form(2.5),
    show_weak_subjects: Optional[bool] = Form(True),
    subject_sort: str = Form("alpha"),
    show_guides: Optional[bool] = Form(False),
) -> JSONResponse:
    if not file.filename or not file.filename.lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Требуется файл XLSX")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Файл слишком большой")

    try:
        options = CurrentReportOptions(
            date_from=date.fromisoformat(date_from),
            date_to=date.fromisoformat(date_to),
            weak_threshold=float(weak_threshold),
            show_weak_subjects=_to_bool(show_weak_subjects, True),
            subject_sort=subject_sort,
            show_guides=_to_bool(show_guides, False),
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Некорректные параметры периода") from exc

    workbook = parser.parse_workbook(content)
    session_id = create_session_id()
    payload = build_session_payload(workbook, options, session_id=session_id)
    session_id = store_session(payload)

    preview = payload.preview.dict()
    preview["session_id"] = session_id

    accept_header = request.headers.get("accept", "")
    if "text/html" in accept_header:
        url = f"/reports/current/preview/ui?session={session_id}"
        return JSONResponse({"redirect": url, "session_id": session_id})
    return JSONResponse({"session_token": session_id, "preview": preview})


@router.get("/current/preview")
async def get_preview(session: str) -> JSONResponse:
    payload = get_session(session)
    if not payload:
        raise HTTPException(status_code=404, detail="Сессия не найдена или истекла")
    return JSONResponse(payload.preview.dict())


@router.get("/current/export/pdf")
async def export_pdf(session: str) -> StreamingResponse:
    payload = get_session(session)
    if not payload:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    buffer = BytesIO()
    pdf_renderer.render_labels_pdf(payload.labels, payload.options, buffer)
    buffer.seek(0)
    klass = payload.labels[0].klass if payload.labels else "klass"
    filename = f"uspevaemost_{klass}_{payload.options.date_from.isoformat()}_{payload.options.date_to.isoformat()}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/current/export/xlsx")
async def export_xlsx(session: str) -> StreamingResponse:
    payload = get_session(session)
    if not payload:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    buffer = BytesIO()
    xlsx_renderer.render_labels_workbook(payload.labels, payload.options, buffer)
    buffer.seek(0)
    klass = payload.labels[0].klass if payload.labels else "klass"
    filename = f"uspevaemost_{klass}_{payload.options.date_from.isoformat()}_{payload.options.date_to.isoformat()}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/current/discard")
async def discard_session(session: str) -> JSONResponse:
    delete_session(session)
    return JSONResponse({"status": "ok"})
