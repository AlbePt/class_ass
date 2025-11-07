from backend.core.services.pdf_renderer import (
    LABEL_HEIGHT_MM,
    LABEL_WIDTH_MM,
    PAGE_HEIGHT_MM,
    PAGE_WIDTH_MM,
    TOP_BOTTOM_MARGIN_MM,
    mm_to_pt,
)


def test_label_geometry_matches_page():
    assert abs(LABEL_WIDTH_MM * 2 - PAGE_WIDTH_MM) < 0.1
    assert abs(TOP_BOTTOM_MARGIN_MM * 2 + LABEL_HEIGHT_MM * 2 - PAGE_HEIGHT_MM) < 0.5


def test_mm_to_pt_conversion():
    assert round(mm_to_pt(10), 2) == round(10 * 72 / 25.4, 2)
