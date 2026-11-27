// ─────────────────────────────────────────────────────────────────────────────
// Report exports (feature 19) — Excel and PDF alongside the existing CSV.
//
// Excel: a real SpreadsheetML 2003 workbook (the XML format Excel reads
// natively) — no dependency, Arabic-safe because everything is UTF-8 XML.
// PDF: browsers already print Arabic perfectly, so the PDF export is a
// print-ready HTML report; the user saves it as PDF from the print dialog.
// ─────────────────────────────────────────────────────────────────────────────

export interface ExportSheet {
  name: string;
  headers: string[];
  rows: (string | number)[][];
}

function xmlEscape(v: string | number): string {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** SpreadsheetML 2003: opens directly in Excel (and imports into Google Sheets). */
export function toExcelXml(sheets: ExportSheet[]): string {
  const body = sheets
    .map((sheet) => {
      const header = sheet.headers.map((h) => `<Cell ss:StyleID="h"><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`).join("");
      const rows = sheet.rows
        .map(
          (row) =>
            `<Row>${row
              .map((cell) =>
                typeof cell === "number" && Number.isFinite(cell)
                  ? `<Cell><Data ss:Type="Number">${cell}</Data></Cell>`
                  : `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`,
              )
              .join("")}</Row>`,
        )
        .join("");
      return `<Worksheet ss:Name="${xmlEscape(sheet.name).slice(0, 31)}"><Table>${header ? `<Row>${header}</Row>` : ""}${rows}</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><DisplayRightToLeft/></WorksheetOptions></Worksheet>`;
    })
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?mso-application progid="Excel.Sheet"?>\n` +
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">` +
    `<Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles>` +
    body +
    `</Workbook>`
  );
}

export interface ReportSection {
  heading: string;
  headers: string[];
  rows: (string | number)[][];
}

function htmlEscape(v: string | number): string {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * A complete print-ready HTML document (RTL, Arabic). The caller opens it in a
 * new window and calls print(); the user picks "Save as PDF". Print CSS hides
 * the on-screen hint so the PDF itself is clean.
 */
export function reportHtml(opts: {
  title: string;
  subtitle?: string;
  sections: ReportSection[];
  footer?: string;
}): string {
  const sections = opts.sections
    .map((s) => {
      const head = s.headers.map((h) => `<th>${htmlEscape(h)}</th>`).join("");
      const rows = s.rows
        .map((r) => `<tr>${r.map((c) => `<td>${htmlEscape(c)}</td>`).join("")}</tr>`)
        .join("\n");
      return `<h2>${htmlEscape(s.heading)}</h2><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>${htmlEscape(opts.title)}</title>
<style>
  body { font-family: Tahoma, Arial, sans-serif; margin: 32px; color: #111; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { color: #555; font-size: 13px; margin: 0 0 24px; }
  h2 { font-size: 15px; margin: 22px 0 8px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #bbb; padding: 6px 10px; font-size: 12.5px; text-align: start; }
  th { background: #f0f0f0; }
  .foot { margin-top: 26px; color: #777; font-size: 11px; }
  .noprint { margin: 0 0 18px; padding: 10px 14px; background: #fff8e0; border: 1px solid #ead27a; font-size: 12.5px; }
  @media print { .noprint { display: none; } }
</style>
</head>
<body>
<p class="noprint">من نافذة الطباعة اختار «حفظ كـ PDF» / Save as PDF.</p>
<h1>${htmlEscape(opts.title)}</h1>
${opts.subtitle ? `<p class="sub">${htmlEscape(opts.subtitle)}</p>` : ""}
${sections}
${opts.footer ? `<p class="foot">${htmlEscape(opts.footer)}</p>` : ""}
</body>
</html>`;
}
