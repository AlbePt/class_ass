from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class ParsedEntry(BaseModel):
    student_fio_raw: str
    student_fio_norm: str
    klass: str
    subject: str
    date: date
    grades: List[int] = Field(default_factory=list)
    attendance: List[str] = Field(default_factory=list)
    raw_text: str
    row: int
    col: int


class StudentSection(BaseModel):
    fio_raw: str
    fio_norm: str
    klass: str
    period_from: Optional[date]
    period_to: Optional[date]
    entries: List[ParsedEntry] = Field(default_factory=list)
    attendance_legend: Dict[str, str] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)


class ParsedWorkbook(BaseModel):
    school_name: Optional[str]
    academic_year_start: Optional[int]
    academic_year_end: Optional[int]
    students: List[StudentSection] = Field(default_factory=list)
    global_warnings: List[str] = Field(default_factory=list)


class SubjectSummary(BaseModel):
    name: str
    grades: List[int] = Field(default_factory=list)
    attendance: List[str] = Field(default_factory=list)
    average: Optional[float] = None
    is_weak: bool = False


class StudentLabel(BaseModel):
    fio: str
    klass: str
    period_from: Optional[date]
    period_to: Optional[date]
    subjects: List[SubjectSummary] = Field(default_factory=list)
    weak_subjects: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class StudentPreview(BaseModel):
    fio: str
    klass: str
    subject_count: int
    average_score: Optional[float]
    has_weak_subjects: bool
    weak_subjects: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class CurrentReportPreview(BaseModel):
    session_id: str
    students: List[StudentPreview] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class CurrentReportOptions(BaseModel):
    date_from: date
    date_to: date
    weak_threshold: float = 2.5
    show_weak_subjects: bool = True
    subject_sort: str = "alpha"  # or "avg_desc"
    show_guides: bool = False


class ReportSessionPayload(BaseModel):
    workbook: ParsedWorkbook
    options: CurrentReportOptions
    preview: CurrentReportPreview
    labels: List[StudentLabel]
