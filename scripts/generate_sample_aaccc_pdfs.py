#!/usr/bin/env python3
"""
scripts/generate_sample_aaccc_pdfs.py
Generates sample official-format AACCC PG Ayurveda Allotment PDFs in raw_pdfs/
(aaccc_2025_r1.pdf, aaccc_2025_r2.pdf, aaccc_2025_r3.pdf, aaccc_2025_svr1.pdf)
to test and verify the pdfplumber parsing pipeline.
"""

import os
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_PDFS_DIR = PROJECT_ROOT / "raw_pdfs"
RAW_PDFS_DIR.mkdir(parents=True, exist_ok=True)

SAMPLE_ALLOTMENTS = [
    # (Rank, Quota, Institute, Course, AllottedCat, CandCat, Remarks)
    ("1", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("14", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.S. AYURVEDA - SHALYA TANTRA", "OPEN", "OPEN", "Allotted"),
    ("35", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - PANCHAKARMA", "OPEN", "OPEN", "Allotted"),
    ("48", "Central Universities", "National Institute of Ayurveda, Jaipur", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("75", "Central Universities", "Faculty of Ayurveda, IMS BHU Varanasi", "M.S. AYURVEDA - SHALYA TANTRA", "OPEN", "OPEN", "Allotted"),
    ("121", "Central Universities", "Faculty of Ayurveda, IMS BHU Varanasi", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("142", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - PRASUTI & STRI ROGA", "OBC", "OBC", "Allotted"),
    ("195", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - DRAVYAGUNA", "EWS", "EWS", "Allotted"),
    ("228", "Central Universities", "National Institute of Ayurveda, Jaipur", "M.D. AYURVEDA - PANCHAKARMA", "OBC", "OBC", "Allotted"),
    ("285", "All India Quota", "Ayurvedic & Unani Tibbia College, New Delhi", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("328", "Central Universities", "National Institute of Ayurveda, Jaipur", "M.S. AYURVEDA - SHALAKYA TANTRA", "OPEN", "OPEN", "Allotted"),
    ("405", "All India Quota", "Institute of Teaching and Research in Ayurveda, Jamnagar", "M.D. AYURVEDA - RASA SHASTRA", "OPEN", "OPEN", "Allotted"),
    ("460", "All India Quota", "Govt. Ayurved College, Raipur", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("560", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - KAUMARBHRITYA", "SC", "SC", "Allotted"),
    ("632", "All India Quota", "R.A. Podar Ayurved Medical College, Mumbai", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("751", "All India Quota", "Govt Ayurveda Medical College, Bengaluru", "M.D. AYURVEDA - PANCHAKARMA", "OPEN", "OPEN", "Allotted"),
    ("828", "Central Universities", "Faculty of Ayurveda, IMS BHU Varanasi", "M.D. AYURVEDA - SWASTHAVRITTA", "SC", "SC", "Allotted"),
    ("890", "All India Quota", "State Ayurvedic College, Lucknow", "M.D. AYURVEDA - KAYACHIKITSA", "OBC", "OBC", "Allotted"),
    ("1120", "All India Quota", "Govt Ayurvedic College, Patna", "M.D. AYURVEDA - SHALYA TANTRA", "OPEN", "OPEN", "Allotted"),
    ("1347", "All India Quota", "Govt Ayurvedic College, Thiruvananthapuram", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("1450", "Central Universities", "Faculty of Ayurveda, IMS BHU Varanasi", "M.D. AYURVEDA - ROGA NIDANA", "ST", "ST", "Allotted"),
    ("1650", "Central Universities", "All India Institute of Ayurveda, New Delhi", "M.D. AYURVEDA - SAMHITA & SIDDHANTA", "ST", "ST", "Allotted"),
    ("3450", "Deemed / Paid", "Bharati Vidyapeeth Deemed University, Pune", "M.D. AYURVEDA - KAYACHIKITSA", "OPEN", "OPEN", "Allotted"),
    ("4325", "Deemed / Paid", "Dr. D.Y. Patil College of Ayurved, Navi Mumbai", "M.S. AYURVEDA - SHALYA TANTRA", "OPEN", "OPEN", "Allotted"),
    ("7640", "Deemed / Paid", "Parul Institute of Ayurved, Vadodara", "M.D. AYURVEDA - PANCHAKARMA", "OPEN", "OPEN", "Allotted"),
]

ROUNDS = [
    ("aaccc_2025_r1.pdf", "ROUND-1 PROVISIONAL ALLOTMENT RESULT - AYUSH PG (AYURVEDA) COUNSELLING 2025", 0),
    ("aaccc_2025_r2.pdf", "ROUND-2 PROVISIONAL ALLOTMENT RESULT - AYUSH PG (AYURVEDA) COUNSELLING 2025", 15),
    ("aaccc_2025_r3.pdf", "ROUND-3 PROVISIONAL ALLOTMENT RESULT - AYUSH PG (AYURVEDA) COUNSELLING 2025", 35),
    ("aaccc_2025_svr1.pdf", "STRAY VACANCY ROUND PROVISIONAL ALLOTMENT - AYUSH PG (AYURVEDA) 2025", 60),
]

def generate_pdf(filename: str, title: str, rank_offset: int):
    filepath = RAW_PDFS_DIR / filename
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=landscape(letter),
        leftMargin=20,
        rightMargin=20,
        topMargin=20,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading2'],
        fontSize=12,
        alignment=1,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )

    cell_style = ParagraphStyle(
        'CellStyle',
        parent=styles['Normal'],
        fontSize=7,
        leading=8
    )

    header_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontSize=8,
        leading=9,
        fontName='Helvetica-Bold',
        textColor=colors.whitesmoke
    )

    story = [
        Paragraph("AYUSH ADMISSIONS CENTRAL COUNSELING COMMITTEE (AACCC)", title_style),
        Paragraph(title, title_style),
        Spacer(1, 6)
    ]

    headers = [
        Paragraph("S.No.", header_style),
        Paragraph("Roll No", header_style),
        Paragraph("Rank", header_style),
        Paragraph("Allotted Quota", header_style),
        Paragraph("Allotted Institute", header_style),
        Paragraph("Course", header_style),
        Paragraph("Allotted Cat", header_style),
        Paragraph("Cand Cat", header_style),
        Paragraph("Remarks", header_style)
    ]

    table_data = [headers]

    for idx, (rank, quota, inst, course, allot_cat, cand_cat, rem) in enumerate(SAMPLE_ALLOTMENTS, 1):
        adjusted_rank = str(int(rank) + rank_offset)
        roll = f"250100{idx:03d}"
        row = [
            Paragraph(str(idx), cell_style),
            Paragraph(roll, cell_style),
            Paragraph(adjusted_rank, cell_style),
            Paragraph(quota, cell_style),
            Paragraph(inst, cell_style),
            Paragraph(course, cell_style),
            Paragraph(allot_cat, cell_style),
            Paragraph(cand_cat, cell_style),
            Paragraph(rem, cell_style),
        ]
        table_data.append(row)

    col_widths = [30, 55, 45, 95, 200, 150, 60, 55, 50]
    t = Table(table_data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#0F172A')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))

    story.append(t)
    doc.build(story)
    print(f"Generated sample official PDF: {filepath.name} ({len(table_data)-1} rows)")

if __name__ == "__main__":
    for fname, title, offset in ROUNDS:
        generate_pdf(fname, title, offset)
    print(f"\nAll sample PDFs generated successfully in {RAW_PDFS_DIR.name}/")
