from __future__ import annotations

from io import BytesIO
from typing import List

import xlsxwriter

from backend.core.models import CurrentReportOptions, StudentLabel
from backend.core.services.pdf_renderer import (
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    mm_to_pt,
)

TOP_BOTTOM_MARGIN_MM = 3.5
LEFT_MARGIN_MM = 0
RIGHT_MARGIN_MM = 0
ROWS_PER_LABEL = 40
COLS_PER_LABEL = 16


def _mm_to_inches(mm_value: float) -> float:
    return mm_value / 25.4


def render_labels_workbook(labels: List[StudentLabel], options: CurrentReportOptions, buffer: BytesIO) -> None:
    workbook = xlsxwriter.Workbook(buffer, {"in_memory": True})
    worksheet = workbook.add_worksheet("Этикетки")

    worksheet.set_paper(9)  # A4
    worksheet.set_portrait()
    worksheet.set_margins(
        top=_mm_to_inches(TOP_BOTTOM_MARGIN_MM),
        bottom=_mm_to_inches(TOP_BOTTOM_MARGIN_MM),
        left=_mm_to_inches(LEFT_MARGIN_MM),
        right=_mm_to_inches(RIGHT_MARGIN_MM),
    )
    worksheet.set_print_scale(100)
    worksheet.center_horizontally()

    row_height_points = mm_to_pt(LABEL_HEIGHT_MM) / ROWS_PER_LABEL
    col_width_pixels = int((mm_to_pt(LABEL_WIDTH_MM) / COLS_PER_LABEL) * 96 / 72)

    for row in range(ROWS_PER_LABEL * 2):
        worksheet.set_row(row, row_height_points)
    for col in range(COLS_PER_LABEL * 2):
        worksheet.set_column_pixels(col, col, col_width_pixels)

    border_format = workbook.add_format(
        {
            "border": 1,
            "valign": "top",
            "text_wrap": True,
            "font_size": 9,
        }
    )
    title_format = workbook.add_format({"bold": True, "font_size": 12})
    weak_format = workbook.add_format({"font_color": "red", "font_size": 9})

    def cell(row_block: int, col_block: int, r: int, c: int) -> tuple[int, int]:
        return row_block * ROWS_PER_LABEL + r, col_block * COLS_PER_LABEL + c

    label_idx = 0
    for row_block in range(2):
        for col_block in range(2):
            if label_idx >= len(labels):
                break
            label = labels[label_idx]
            start_row, start_col = cell(row_block, col_block, 0, 0)
            end_row, end_col = cell(row_block, col_block, ROWS_PER_LABEL - 1, COLS_PER_LABEL - 1)

            worksheet.merge_range(start_row, start_col, start_row + 3, end_col, label.fio, title_format)
            worksheet.write(start_row + 4, start_col, f"Класс: {label.klass}")
            if label.period_from and label.period_to:
                worksheet.write(
                    start_row + 5,
                    start_col,
                    f"Период: {label.period_from.strftime('%d.%m.%Y')} — {label.period_to.strftime('%d.%m.%Y')}",
                )

            current_row = start_row + 7
            hidden_subjects = 0
            for summary in label.subjects:
                if current_row > end_row - 6:
                    hidden_subjects += 1
                    continue
                grades_text = ", ".join(map(str, summary.grades)) if summary.grades else "—"
                avg_text = f"{summary.average:.1f}" if summary.average is not None else "—"
                worksheet.merge_range(current_row, start_col, current_row, start_col + 5, summary.name, border_format)
                worksheet.merge_range(current_row, start_col + 6, current_row, start_col + 9, grades_text, border_format)
                worksheet.merge_range(current_row, start_col + 10, current_row, start_col + 11, avg_text, border_format)
                if summary.is_weak:
                    worksheet.write_comment(current_row, start_col, "Слабый предмет")
                current_row += 1

            if hidden_subjects:
                worksheet.merge_range(
                    current_row, start_col, current_row, start_col + 6, f"+ ещё {hidden_subjects} предметов", border_format
                )
                current_row += 1

            if options.show_weak_subjects and label.weak_subjects:
                worksheet.merge_range(
                    current_row, start_col, current_row, start_col + 8, "Слабые предметы:", weak_format
                )
                worksheet.merge_range(
                    current_row,
                    start_col + 8,
                    current_row,
                    start_col + 15,
                    ", ".join(label.weak_subjects),
                    weak_format,
                )
                current_row += 1

            worksheet.merge_range(
                current_row + 1, start_col, current_row + 1, start_col + 10, "Подпись кл. руководителя __________"
            )
            worksheet.merge_range(
                current_row + 2, start_col, current_row + 2, start_col + 10, "Подпись родителя __________"
            )

            label_idx += 1

    worksheet.set_h_pagebreaks([ROWS_PER_LABEL])
    worksheet.set_v_pagebreaks([COLS_PER_LABEL])
    workbook.close()
