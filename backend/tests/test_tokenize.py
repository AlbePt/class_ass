from backend.core.parsing.quarter_parser import ATTENDANCE_DEFAULT, QuarterReportParser


def test_tokenize_grade_variations():
    parser = QuarterReportParser()
    grades, attendance, warnings, multiple = parser._tokenize_cell("3/3", set(ATTENDANCE_DEFAULT))
    assert grades == [3, 3]
    assert not attendance
    assert multiple
    assert not warnings

    grades, attendance, warnings, multiple = parser._tokenize_cell("0 3", set(ATTENDANCE_DEFAULT))
    assert grades == [3]
    assert "invalid_grade 0" in warnings[0]

    grades, attendance, warnings, multiple = parser._tokenize_cell("3 Н", set(ATTENDANCE_DEFAULT))
    assert grades == [3]
    assert attendance == ["Н"]
