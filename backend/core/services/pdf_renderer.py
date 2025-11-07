from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from io import BytesIO
from typing import Iterable, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

from backend.core.models import CurrentReportOptions, StudentLabel, SubjectSummary

PAGE_WIDTH_MM = 210
PAGE_HEIGHT_MM = 297
LABEL_WIDTH_MM = 105
LABEL_HEIGHT_MM = 145
TOP_BOTTOM_MARGIN_MM = 3.5
LEFT_MARGIN_MM = 0
RIGHT_MARGIN_MM = 0
INNER_PADDING_MM = 5
GUIDE_STROKE_PT = 0.25


def mm_to_pt(value_mm: float) -> float:
    return value_mm * mm


def render_labels_pdf(labels: List[StudentLabel], options: CurrentReportOptions, buffer: BytesIO) -> None:
    pdf = canvas.Canvas(buffer, pagesize=A4)
    page_width_pt, page_height_pt = A4

    label_width_pt = mm_to_pt(LABEL_WIDTH_MM)
    label_height_pt = mm_to_pt(LABEL_HEIGHT_MM)
    padding_pt = mm_to_pt(INNER_PADDING_MM)
    top_margin_pt = mm_to_pt(TOP_BOTTOM_MARGIN_MM)

    styles = {
        "header": ParagraphStyle(name="Header", fontName="Helvetica-Bold", fontSize=12, leading=14),
        "body": ParagraphStyle(name="Body", fontName="Helvetica", fontSize=9, leading=11),
        "weak": ParagraphStyle(name="Weak", fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=colors.red),
        "meta": ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=8, leading=9),
    }

    labels_iter = iter(labels)
    while True:
        positions = [
            (mm_to_pt(LEFT_MARGIN_MM) + col * label_width_pt, page_height_pt - top_margin_pt - (row + 1) * label_height_pt)
            for row in range(2)
            for col in range(2)
        ]
        drew_any = False
        for index, (x, y) in enumerate(positions):
            try:
                label = next(labels_iter)
            except StopIteration:
                break
            draw_label(pdf, label, options, x, y, label_width_pt, label_height_pt, padding_pt)
            drew_any = True
        if not drew_any:
            break
        if options.show_guides:
            draw_guides(pdf, label_width_pt, label_height_pt, top_margin_pt)
        pdf.showPage()
    pdf.save()


def draw_guides(pdf: canvas.Canvas, label_width_pt: float, label_height_pt: float, top_margin_pt: float) -> None:
    pdf.setStrokeColor(colors.lightgrey)
    pdf.setLineWidth(GUIDE_STROKE_PT)
    for row in range(3):
        y = top_margin_pt + row * label_height_pt
        pdf.line(0, y, mm_to_pt(PAGE_WIDTH_MM), y)
    for col in range(3):
        x = col * label_width_pt
        pdf.line(x, 0, x, mm_to_pt(PAGE_HEIGHT_MM))


def draw_label(
    pdf: canvas.Canvas,
    label: StudentLabel,
    options: CurrentReportOptions,
    x: float,
    y: float,
    width: float,
    height: float,
    padding: float,
) -> None:
    pdf.setStrokeColor(colors.black)
    pdf.setLineWidth(0.5)
    pdf.rect(x, y, width, height, stroke=1, fill=0)

    cursor_x = x + padding
    cursor_y = y + height - padding

    def write_paragraph(text: str, style: ParagraphStyle) -> float:
        para = Paragraph(text, style)
        w, h = para.wrap(width - 2 * padding, height)
        para.drawOn(pdf, cursor_x, cursor_y - h)
        return h

    fio_text = f"<b>{label.fio}</b>"
    consumed = write_paragraph(fio_text, ParagraphStyle(name="Fio", fontName="Helvetica-Bold", fontSize=13, leading=15))
    cursor_y -= consumed + 2

    meta_lines = []
    if label.klass:
        meta_lines.append(f"Класс: {label.klass}")
    if label.period_from and label.period_to:
        meta_lines.append(
            f"Период: {label.period_from.strftime('%d.%m.%Y')} — {label.period_to.strftime('%d.%m.%Y')}"
        )
    elif label.period_from or label.period_to:
        single = label.period_from or label.period_to
        if single:
            meta_lines.append(f"Период: {single.strftime('%d.%m.%Y')}")
    if meta_lines:
        consumed = write_paragraph("<br/>".join(meta_lines), ParagraphStyle(name="Meta", fontName="Helvetica", fontSize=9, leading=11))
        cursor_y -= consumed + 2

    subject_lines: List[str] = []
    hidden_subjects = 0
    available_height = cursor_y - (y + padding + 40)
    for summary in label.subjects:
        avg_text = f"{summary.average:.1f}" if summary.average is not None else "—"
        grades_text = ", ".join(map(str, summary.grades)) if summary.grades else "—"
        line = f"<b>{summary.name}</b>: {grades_text} (ср. {avg_text})"
        style = ParagraphStyle(name="Subject", fontName="Helvetica", fontSize=9, leading=11)
        if summary.is_weak:
            style.textColor = colors.red
        height = Paragraph(line, style).wrap(width - 2 * padding, height)[1]
        if available_height - height < 0:
            hidden_subjects += 1
            continue
        available_height -= height
        subject_lines.append((line, style))

    for line, style in subject_lines:
        consumed = write_paragraph(line, style)
        cursor_y -= consumed

    if hidden_subjects:
        cursor_y -= write_paragraph(f"+ ещё {hidden_subjects} предметов", ParagraphStyle(name="More", fontName="Helvetica", fontSize=8, leading=9))

    if options.show_weak_subjects and label.weak_subjects:
        weak_text = "Слабые предметы: " + ", ".join(label.weak_subjects)
        cursor_y -= write_paragraph(weak_text, ParagraphStyle(name="Weak", fontName="Helvetica", fontSize=9, leading=11, textColor=colors.red))

    cursor_y -= write_paragraph("Подпись кл. руководителя __________", ParagraphStyle(name="Sign", fontName="Helvetica", fontSize=9, leading=11))
    cursor_y -= write_paragraph("Подпись родителя __________", ParagraphStyle(name="Sign", fontName="Helvetica", fontSize=9, leading=11))


__all__ = ["render_labels_pdf", "mm_to_pt", "LABEL_WIDTH_MM", "LABEL_HEIGHT_MM", "PAGE_WIDTH_MM", "PAGE_HEIGHT_MM", "TOP_BOTTOM_MARGIN_MM"]
