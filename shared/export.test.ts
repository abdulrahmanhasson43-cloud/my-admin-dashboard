import { describe, expect, it } from "vitest";
import { reportHtml, toExcelXml } from "./export";

describe("toExcelXml (feature 19)", () => {
  const sheets = [
    { name: "الإيرادات", headers: ["الكورس", "المبيعات", "الإيراد (ج.م)"], rows: [["بكالوريا علوم", 3, 1500], ["تأسيس & <تمهيدي>", 1, 400]] },
  ];

  it("emits a SpreadsheetML workbook with the sheet, headers and rows", () => {
    const xml = toExcelXml(sheets);
    expect(xml).toContain('<?mso-application progid="Excel.Sheet"?>');
    expect(xml).toContain('ss:Name="الإيرادات"');
    expect(xml).toContain("<DisplayRightToLeft/>");
    expect(xml).toContain('<Data ss:Type="String">بكالوريا علوم</Data>');
    expect(xml).toContain('<Data ss:Type="Number">1500</Data>');
  });

  it("escapes XML special characters in cell text", () => {
    const xml = toExcelXml(sheets);
    expect(xml).toContain("تأسيس &amp; &lt;تمهيدي&gt;");
    expect(xml).not.toContain("<تمهيدي>");
  });

  it("supports several sheets", () => {
    const xml = toExcelXml([sheets[0], { name: "Second", headers: ["a"], rows: [[1]] }]);
    expect(xml.match(/<Worksheet /g)).toHaveLength(2);
  });
});

describe("reportHtml (feature 19 — PDF via print)", () => {
  it("builds an RTL Arabic document with every section and row", () => {
    const html = reportHtml({
      title: "تقرير الإيرادات",
      subtitle: "منصة مدار",
      sections: [{ heading: "حسب الكورس", headers: ["الكورس", "الإيراد"], rows: [["علوم", 1500]] }],
      footer: "أُنشئ بواسطة مدار",
    });
    expect(html).toContain('dir="rtl"');
    expect(html).toContain("<title>تقرير الإيرادات</title>");
    expect(html).toContain("<h2>حسب الكورس</h2>");
    expect(html).toContain("<td>علوم</td>");
    expect(html).toContain("Save as PDF");
    expect(html).toContain("@media print");
  });

  it("escapes HTML in values", () => {
    const html = reportHtml({ title: "t", sections: [{ heading: "h", headers: ["x"], rows: [["<script>"]] }] });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
