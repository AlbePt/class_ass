from __future__ import annotations

from collections import defaultdict
from statistics import mean
from typing import Dict, List, Tuple

from backend.core.models import (
    CurrentReportOptions,
    CurrentReportPreview,
    ParsedWorkbook,
    ReportSessionPayload,
    StudentLabel,
    StudentPreview,
    SubjectSummary,
)


def build_current_report(
    workbook: ParsedWorkbook, options: CurrentReportOptions
) -> Tuple[List[StudentLabel], CurrentReportPreview]:
    students_labels: List[StudentLabel] = []
    preview_students: List[StudentPreview] = []
    warnings: List[str] = list(workbook.global_warnings)

    for section in sorted(workbook.students, key=lambda s: s.fio_norm.lower()):
        grouped: Dict[str, Dict[str, List]] = defaultdict(lambda: {"grades": [], "attendance": []})
        for entry in section.entries:
            if entry.date < options.date_from or entry.date > options.date_to:
                continue
            subj = entry.subject.strip()
            if not subj:
                continue
            grouped[subj]["grades"].extend(entry.grades)
            grouped[subj]["attendance"].extend(entry.attendance)

        subject_summaries: List[SubjectSummary] = []
        weak_subjects: List[str] = []
        for subject, buckets in grouped.items():
            avg = None
            if buckets["grades"]:
                avg = round(mean(buckets["grades"]), 1)
            summary = SubjectSummary(
                name=subject,
                grades=sorted(buckets["grades"], reverse=True),
                attendance=buckets["attendance"],
                average=avg,
            )
            if avg is not None and avg < options.weak_threshold:
                summary.is_weak = True
                weak_subjects.append(subject)
            subject_summaries.append(summary)

        if options.subject_sort == "avg_desc":
            subject_summaries.sort(
                key=lambda s: (s.average if s.average is not None else -1.0), reverse=True
            )
        else:
            subject_summaries.sort(key=lambda s: s.name.lower())

        label = StudentLabel(
            fio=section.fio_norm or section.fio_raw,
            klass=section.klass or "",
            period_from=section.period_from,
            period_to=section.period_to,
            subjects=subject_summaries,
            weak_subjects=weak_subjects,
            warnings=section.warnings,
        )
        students_labels.append(label)

        avg_all = None
        all_grades = [grade for summary in subject_summaries for grade in summary.grades]
        if all_grades:
            avg_all = round(mean(all_grades), 1)
        preview_students.append(
            StudentPreview(
                fio=label.fio,
                klass=label.klass,
                subject_count=len(subject_summaries),
                average_score=avg_all,
                has_weak_subjects=bool(weak_subjects) if options.show_weak_subjects else False,
                weak_subjects=weak_subjects if options.show_weak_subjects else [],
                warnings=section.warnings,
            )
        )

    preview = CurrentReportPreview(
        session_id="",
        students=preview_students,
        warnings=warnings,
    )
    return students_labels, preview


def build_session_payload(workbook: ParsedWorkbook, options: CurrentReportOptions, session_id: str) -> ReportSessionPayload:
    labels, preview = build_current_report(workbook, options)
    preview.session_id = session_id
    return ReportSessionPayload(
        workbook=workbook,
        options=options,
        preview=preview,
        labels=labels,
    )


__all__ = ["build_current_report", "build_session_payload"]
